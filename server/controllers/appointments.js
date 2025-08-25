const Appointment = require("../models/appointment");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Prescription = require("../models/Prescription");

// Search by MRN, Name, or Phone
async function searchAppointment(req, res) {
  try {
    const { query } = req.query  // string input from frontend

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Please provide an MRN, name, or phone number.",
      })
    }

    // Case-insensitive search for name, exact match for MRN and phone
    const appointments = await Appointment.find({
      $or: [
        { mrn: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }, // i = case-insensitive
      ],
    })

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No appointment found with the given input.",
      })
    }

    res.json({
      success: true,
      data: appointments,
    })
  } catch (error) {
    console.error("Error searching appointment:", error)
    res.status(500).json({
      success: false,
      message: "Server error while searching for appointment.",
    })
  }
}

// Add a new appointment
async function addAppointment(req, res) {
  try {
    const appointmentData = req.body;

    // create a new appointment
    const appointment = new Appointment(appointmentData);
    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Error adding appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add appointment",
      error: error.message,
    });
  }
}

// Get all pending appointments
async function pendingAppointments(req, res) {
  try {
    const appointments = await Appointment.find({ status: "Pending" }).sort({
      date: 1, // earliest first
      timeIn: 1,
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching pending appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending appointments",
      error: error.message,
    });
  }
}

// Get all the appointments for a specific date
async function historyAppointments(req, res) {
  try {
    const { date } = req.query; // expects ?date=YYYY-MM-DD

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date query parameter is required",
      });
    }

    // Match appointments by date only (ignoring time)
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ timeIn: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching history appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch history appointments",
      error: error.message,
    });
  }
}

async function getAppointmentData(req, res) {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error fetching appointment data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment data",
      error: error.message,
    });
  }
}

// ✅ Update appointment time (timeIn & timeOut)
async function updateAppointmentTime(req, res) {
  try {
    const { id } = req.params;
    const { timeIn, timeOut } = req.body;

    if (!timeIn || !timeOut) {
      return res.status(400).json({
        success: false,
        message: "Both timeIn and timeOut are required",
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { timeIn, timeOut },
      { new: true } // return updated doc
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment time:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      error: error.message,
    });
  }
}

// Create folder if not exists
const prescriptionsDir = path.join(__dirname, "../Prescriptions");
if (!fs.existsSync(prescriptionsDir)) {
  fs.mkdirSync(prescriptionsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, prescriptionsDir);
  },
  filename: function (req, file, cb) {
    const { mrn } = req.body;
    if (!mrn) {
      return cb(new Error("MRN is required"), null);
    }

    const filePath = path.join(prescriptionsDir, `${mrn}.pdf`);

    // ✅ If file exists, delete it first
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    cb(null, `${mrn}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Controller to handle prescription upload
async function uploadPrescription(req, res) {
  try {
    const { mrn, templateName } = req.body;


    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Save record in DB
    const prescription = new Prescription({
      mrn,
      fileName: req.file.filename,
      filePath: `/Prescriptions/${req.file.filename}`,
    });

    await prescription.save();

    // ⬇️ Update appointment with the template used
    await Appointment.findOneAndUpdate(
      { mrn },
      { template: templateName, status: "Completed" }, // also mark appointment as Completed
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Prescription saved successfully",
      data: prescription,
    });
  } catch (error) {
    console.error("Error saving prescription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save prescription",
      error: error.message,
    });
  }
}

module.exports = {
  addAppointment,
  pendingAppointments,
  historyAppointments,
  updateAppointmentTime,
  getAppointmentData,
  uploadPrescription,
  upload,
  searchAppointment
};
