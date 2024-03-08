const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const setupSocket = require("./handlers/socketHandlers");
const bodyParser = require("body-parser");
const multer = require("multer");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoute");
const meetingRoutes = require("./routes/meetingroute");
require("dotenv").config(); // Load environment variables from .env file

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://aadishfr:t7KH2dROTp0joTRV@cluster0.avq0lyr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
  })
);

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Your existing socket setup
setupSocket(server);

// Your existing route for handling static files
app.use("/api/user", userRoutes);
app.use("/api/meeting", meetingRoutes);

// Route for handling file uploads
app.post("/uploads", upload.single("file"), (req, res) => {
  try {
    // Access the uploaded file through req.file
    const uploadedFile = req.file;

    // Log the file details to the console
    console.log("Received file:", uploadedFile.originalname);

    // Send a response back to the client
    res.status(200).json({
      message: "File upload successful",
      file: uploadedFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post("/gpt-api", async (req, res) => {
  try {
    const prompt = req.query.prompt;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer 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", // Replace YOUR_API_KEY with your actual OpenAI API key
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You have to only summarize the given prompt to you. Nothing more that. You recieve a meetings transciption than you have to generate summary of that. Summanry is crisp and concise.",
          },
          { role: "user", content: prompt },
        ],
        n: 1,
      }),
    });

    const data = await response.json();

    res.json({ response: data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal server error",
  });
});

app.get("/test", (req, res) => {
  res.send("Testing");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
