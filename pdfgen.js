const fs = require('fs');
const path = require('path');
const pdf = require('pdf-creator-node');
const admin = require('firebase-admin');

// Assuming you have already initialized your Firebase app elsewhere or you will do it here
// It's important not to initialize the Firebase app more than once
if (admin.apps.length === 0) { // Only initialize if no apps are already initialized.
  const serviceAccount = require('./meetx-415610-firebase-adminsdk-5wp0d-7391dd226c.json'); // Path to your Firebase service account key JSON file

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://meetx-415610.appspot.com'
  });
}

const bucket = admin.storage().bucket();

async function generatePDF(text) {
  // Define the PDF template
  const htmlTemplate = `
    <html>
      <head>
        <title>Summary PDF</title>
      </head>
      <body>
        <h1>Summary</h1>
        <p>${text}</p>
      </body>
    </html>
  `;

  // Define PDF options
  const options = {
    format: 'A4',
    orientation: 'portrait',
    border: '10mm',
  };

  // Generate PDF locally
  const document = {
    html: htmlTemplate,
    data: {},
    path: './output/summary.pdf' // Temporarily save PDF locally
  };

  try {
    const res = await pdf.create(document, options);
    console.log('PDF Path:', res.filename); // Log the path where the PDF is saved locally

    // Save the PDF to Firebase Storage
    const filename = `transcription_summary/summary_${Date.now()}.pdf`;
    await bucket.upload(res.filename, {
      destination: filename,
      gzip: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    console.log(`PDF saved to Firebase Storage: ${filename}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

module.exports = { generatePDF };
