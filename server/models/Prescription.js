const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  mrn: {
    type: String,  // store MRN as string
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
