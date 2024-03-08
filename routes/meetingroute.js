const express = require("express");
const {
  createMeeting,
  getPastMeetings,
  getSummary,
} = require("../controller/meeting.controller");
const { protect } = require("../middleware/verify");

const meetingRoutes = express.Router();

// meetingRoutes.post('/create', protect, createMeeting);
meetingRoutes.post("/create", createMeeting);
meetingRoutes.get("/getPast", protect, getPastMeetings);
meetingRoutes.get("/getSummary", getSummary);

module.exports = meetingRoutes;
