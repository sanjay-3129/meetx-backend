const Meeting = require("../models/meeting.model");
const processChatCompletions = require("../openai");
const audioStorage = require("../audiostorage");
const pdfgen = require("../pdfgen");

const createMeeting = async (req, res) => {
  console.log("check");
  try {
    console.log(req.user);
    const userId = req.user;
    const newMeet = await Meeting.create({
      user: userId,
      ...req.body,
    });
    res.status(200).json({
      status: "Success",
      data: newMeet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPastMeetings = async (req, res) => {
  const userId = req.user; // Assuming user is authenticated and user data is available in req.user

  try {
    // Find meetings of the user sorted by date in descending order
    const recentMeetings = await Meeting.find({ user: userId })
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
      .exec();

    res.status(200).json({
      status: "Success",
      data: recentMeetings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSummary = async (req, res) => {
  try {
    const { newtrans } = req.body;
    console.log(newtrans);
    const summary = await processChatCompletions(newtrans);
    console.log(summary);

    // pdfgen.generatePDF(summary);

    // // Upload the audio file to Firebase Storage
    // const audioFilename = await audioStorage.uploadAudio(audioBytes);
    // console.log(audioFilename);

    // // Find meetings of the user sorted by date in descending order
    // const recentMeetings = await Meeting.find({ user: userId })
    //     .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
    //     .exec();

    res.status(200).json({
      status: "Success",
      data: summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateMeeting = async (req, res) => {
  const meetingId = req.params.id;
  const { transcription, summaryurl, audiourl } = req.body;

  try {
    // Find the meeting by ID
    let meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Update the specified fields
    if (transcription !== undefined) {
      meeting.transcription = transcription;
    }
    if (summaryurl !== undefined) {
      meeting.summaryurl = summaryurl;
    }
    if (audiourl !== undefined) {
      meeting.audiourl = audiourl;
    }

    // Save the updated meeting
    await meeting.save();

    res.status(200).json({
      status: "Success",
      data: meeting,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createMeeting,
  getPastMeetings,
  getSummary,
};
