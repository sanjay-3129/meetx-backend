const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String },
  description: { type: String },
  transcription: { type: String },
  summaryurl: { type: String },
  audiourl: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const Meeting = mongoose.model('Meeting', meetingSchema);
module.exports = Meeting;
