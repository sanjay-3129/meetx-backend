const admin = require("firebase-admin");
const { getStorage, getDownloadURL } = require("firebase-admin/storage");

// Initialize Firebase Admin SDK only if it hasn't been initialized yet
if (admin.apps.length === 0) {
  const serviceAccount = require("./meetx-415610-firebase-adminsdk-5wp0d-7391dd226c.json"); // Ensure this path is correct

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://meetx-415610-rs5a1.appspot.com", // Make sure the URL is correct, including 'appspot.com'
  });
}

// Get a reference to the storage service
const bucket = admin.storage().bucket();

async function uploadAudio(audioBuffer) {
  try {
    // Define a unique filename for the audio file
    const filename = `audio_recordings/recording_${Date.now()}.wav`;
    const file = bucket.file(filename); // Create a file reference in the bucket

    // Upload the audio buffer to Firebase Storage
    await file.save(audioBuffer, {
      metadata: {
        contentType: "audio/wav", // Set the content type to the correct MIME type
        cacheControl: "public, max-age=31536000",
      },
      gzip: true, // Compress the file for upload
    });

    const downloadURL = await getDownloadURL(file);
    console.log("downloadURL: ", downloadURL);

    // console.log(`Audio file saved to Firebase Storage: ${filename}`);
    return { filename, downloadURL }; // Return the filename or any other relevant information
  } catch (error) {
    console.error("Error uploading audio file:", error);
    throw error; // Rethrow the error after logging
  }
}

module.exports = { uploadAudio };
