const mongoose = require("mongoose");

const labSchema = new mongoose.Schema({
  mrn: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Lab", labSchema);
