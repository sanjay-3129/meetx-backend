const { SpeechClient } = require("@google-cloud/speech");
const { AssemblyAI } = require("assemblyai");

// Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
// process.env.GOOGLE_APPLICATION_CREDENTIALS = "./meetx-415610-b2f2fa1a2952.json";
process.env.GOOGLE_APPLICATION_CREDENTIALS =
  "./meetx-415610-firebase-adminsdk-5wp0d-7391dd226c.json";

// Initialize SpeechClient
const speechClient = new SpeechClient();

async function transcribeAudio(audioBytes) {
  try {
    // Perform transcription using Google Cloud Speech API
    const [operation] = await speechClient.longRunningRecognize({
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
        model: "latest_long",
      },
    });

    // Wait for the operation to complete
    const [response] = await operation.promise();

    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    return transcription;
  } catch (error) {
    throw new Error(`Error in transcription: ${error.message}`);
  }
}

const transcribeAudioAssemblyAI = async (audioBytes) => {
  const client = new AssemblyAI({
    apiKey: "805b5bb5a16547909b5f1ee127e9fa4a",
  });

  const transcript = await client.transcripts.transcribe({
    audio: audioBytes,
    language_detection: true,
  });

  if (transcript.status === "error") {
    console.log("transcript.error: ", transcript.error);
  } else {
    console.log("transcription: ", transcript.text);
    return transcript.text;
  }
};

module.exports = {
  transcribeAudio,
  transcribeAudioAssemblyAI,
};
