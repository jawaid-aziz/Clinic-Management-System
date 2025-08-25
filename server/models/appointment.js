const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  mrn: {
    type: String,
    required: true,
    unique: true, // Medical Record Number should be unique
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sex: {
    type: String,
    enum: ["male", "female", "other"], // restrict to known values
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
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
  weight: {
    type: Number, // kg
    min: 0,
  },
  height: {
    type: Number, // cm
    min: 0,
  },
  bp: {
    type: String, // e.g., "120/80"
  },
  pulse: {
    type: Number, // bpm
    min: 0,
  },
  temperature: {
    type: Number, // Celsius
  },
  vco: {
    type: Boolean,
    default: false,
  },
  gestation: {
    type: String, // e.g. "12 weeks"
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
