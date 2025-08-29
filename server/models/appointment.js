const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  mrn: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sex: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // default to current date
  },
  timeIn: {
    type: String, // can store "10:30 AM" etc.
  },
  timeOut: {
    type: String, // can store "10:30 AM" etc.
  },
  doctor: {
    type: String,
    enum: ["paediatrics", "gynae"],
    required: true,
  },
  cnic: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  weight: {
    type: String,
  },
  height: {
    type: String,
  },
  bp: {
    type: String,
  },
  pulse: {
    type: String,
  },
  temperature: {
    type: Number,
  },
  vco: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Cancelled"], // restrict to known values
    default: "Pending", // default status
  },
  template: {
    type: String,
    default: "",
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
