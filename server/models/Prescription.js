const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  mrn: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String, // Cloudinary public_id (useful if you want to delete/update later)
    required: true,
  },
  url: {
    type: String, // Secure Cloudinary URL
    required: true,
  },
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
