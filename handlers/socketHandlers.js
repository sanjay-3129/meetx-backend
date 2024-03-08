const socketIO = require("socket.io");
const transcriptionService = require("../transcriptionService");
const OpenAIService = require("../openai");
const processChatCompletions = require("../openai");
const pdfgen = require("../pdfgen");
const audioStorage = require("../audiostorage"); // Import the new module
const { AssemblyAI, RealtimeTranscript } = require("assemblyai");
const { Readable } = require("stream");

function setupSocket(server) {
  const io = socketIO(server);
  const client = new AssemblyAI({
    apiKey: "805b5bb5a16547909b5f1ee127e9fa4a",
  });

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.on("setup", (userData) => {
      socket.emit("connected");
    });

    socket.on("start-live", async () => {
      console.log("start-live");
      await transcriber.connect();
    });

    const transcriber = client.realtime.transcriber({
      sampleRate: 16_000,
    });

    transcriber.on("open", ({ sessionId }) => {
      console.log(`Session opened with ID: ${sessionId}`);
    });

    transcriber.on("error", (error) => {
      console.error("Error:", error);
    });

    transcriber.on("close", (code, reason) =>
      console.log("Session closed:", code, reason)
    );

    transcriber.on("transcript", (transcript) => {
      console.log("transcript: ", transcript);
      if (!transcript.text) {
        return;
      }

      if (transcript.message_type === "PartialTranscript") {
        console.log("Partial:", transcript.text);
      } else {
        console.log("Final:", transcript.text);
      }
    });

    socket.on("disconnect-live", () => {
      transcriber.close();
    });

    socket.on("live-audio", async (audioChunks) => {
      try {
        console.log("Connecting to real-time transcript service");

        console.log("Starting recording");

        // Readable.toWeb(audioChunks).pipeTo(transcriber.stream());
        // Convert the Buffer to a Readable stream
        const readableStream = new Readable();
        readableStream._read = () => {}; // Implement _read function for a Readable stream

        // Push data to the Readable stream
        readableStream.push(audioChunks);
        readableStream.push(null);

        // Manually read data from the Readable stream and send it to transcriber
        readableStream.on("data", (chunk) => {
          console.log("test");
          try {
            transcriber.sendAudio(chunk);
          } catch (e) {
            // transcriber.connect();
          }
        });
        // Stop recording and close connection using Ctrl-C.
        process.on("SIGINT", async function () {
          console.log();
          console.log("Stopping recording");
          recording.stop();

          console.log("Closing real-time transcript connection");
          await transcriber.close();

          process.exit();
        });
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("audio", async (audioBytes) => {
      console.log("Received audio from client");
      try {
        const newtrans = await transcriptionService.transcribeAudio(audioBytes);
        // const newtrans = await transcriptionService.transcribeAudioAssemblyAI(
        //   // 'https://storage.googleapis.com/aai-web-samples/5_common_sports_injuries.mp3'
        //   audioBytes
        // );
        console.log("newtrans: ", newtrans);
        socket.emit("trans", { text: newtrans });
        // const summary = await processChatCompletions(newtrans);
        // pdfgen.generatePDF(summary);
        // // Upload the audio file to Firebase Storage
        const audioFilename = await audioStorage.uploadAudio(audioBytes);
        console.log(`Audio file saved to Firebase Storage: ${audioFilename}`);
        // for assembly ai, stored, we need mp3 file
        // Upload the audio file to Firebase Storage
        // console.log("audioBytes: ", audioBytes);
        // const { downloadURL } = await audioStorage.uploadAudio(audioBytes);
        // console.log(`Audio file saved to Firebase Storage: ${downloadURL}`);
        // const newtrans = await transcriptionService.transcribeAudioAssemblyAI(
        //   // "https://storage.googleapis.com/aai-web-samples/5_common_sports_injuries.mp3"
        //   // audioBytes
        //   downloadURL
        // );
        // console.log("newtrans: ", newtrans);
        // socket.emit("trans", { text: newtrans });
        // const summary = await processChatCompletions(newtrans);
        // pdfgen.generatePDF(summary);
      } catch (error) {
        console.error("Error processing audio:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });

    socket.on("started", () => {
      console.log("reording started");
    });
  });
}

module.exports = setupSocket;
