const Appointment = require("../models/appointment");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Prescription = require("../models/Prescription");
const cloudinary = require("../config/cloudinary");
const Lab = require("../models/Lab");

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
    const { role } = req.query; // role will come from frontend query param

    // Build filter dynamically
    const filter = { status: "Pending" };
    if (role === "gynae" || role === "paediatrics") {
      filter.doctor = role; // assuming Appointment schema has "doctor"
    }

    const appointments = await Appointment.find(filter).sort({
      date: 1,
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

async function saveLabTests(req, res) {
  try {
    const { id } = req.params;
    const { labType, selectedTests } = req.body;

    if (!labType || !selectedTests || selectedTests.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Lab Tests are required.",
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { labLocation: labType, labs: selectedTests, labCollection: "Pending" },
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
      message: "Lab Tests saved successfully",
      data: updatedAppointment,
    });

  } catch (error) {
    console.error("Error saving lab tests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save lab tests",
      error: error.message,
    });
    console.log(error);
  }
}

const upload = multer({
  storage: multer.memoryStorage(), // keep file in memory
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

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

    // 🔼 Upload buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw", // important for PDFs!
            folder: "prescriptions", // Cloudinary folder
            public_id: mrn, // make MRN the filename
            overwrite: true, // replace if exists
            format: "pdf", // ensure PDF format
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer); // send file buffer
    });

    // 🧠 Upsert (create or update) prescription in DB
    const prescription = await Prescription.findOneAndUpdate(
      { mrn },
      {
        cloudinaryId: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
      { upsert: true, new: true } // create if not found, return updated doc
    );

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

// Controller to open prescription file in new tab
async function getPrescription(req, res) {
  try {
    const { mrn } = req.params; // assuming route is /prescription/:mrn

    if (!mrn) {
      return res.status(400).json({
        success: false,
        message: "MRN is required",
      });
    }

    // Check DB
    const prescription = await Prescription.findOne({ mrn });
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found in database",
      });
    }

    // ✅ Generate a signed inline URL
    const signedUrl = cloudinary.url(prescription.url, {
      sign_url: true,    // important for signed access
    });

    return res.redirect(signedUrl);

  } catch (error) {
    console.error("Error fetching prescription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescription",
      error: error.message,
    });
  }
}

// ✅ Delete appointment + prescription (DB + file)
async function deleteAppointment(req, res) {
  try {
    const { mrn } = req.body;

    if (!mrn) {
      return res.status(400).json({
        success: false,
        message: "MRN is required",
      });
    }

    // 1. Delete the appointment
    const appointment = await Appointment.findOneAndDelete({ mrn });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "No appointment found with this MRN",
      });
    }

    // 2. Find prescription (if any)
    const prescription = await Prescription.findOneAndDelete({ mrn });

    // 3. If prescription exists, also delete from Cloudinary
    if (prescription) {
      try {
        await cloudinary.uploader.destroy(prescription.cloudinaryId, {
          resource_type: "raw", // important for PDFs
        });
        console.log(`Deleted prescription from Cloudinary: ${prescription.cloudinaryId}`);
      } catch (cloudErr) {
        console.error("Failed to delete from Cloudinary:", cloudErr);
      }
    }

    // 2. Find prescription (if any)
    const labReport = await Lab.findOneAndDelete({ mrn });

    // 3. If prescription exists, also delete from Cloudinary
    if (labReport) {
      try {
        await cloudinary.uploader.destroy(labReport.cloudinaryId, {
          resource_type: "raw", // important for PDFs
        });
        console.log(`Deleted lab report from Cloudinary: ${labReport.cloudinaryId}`);
      } catch (cloudErr) {
        console.error("Failed to delete from Cloudinary:", cloudErr);
      }
    }

    res.status(200).json({
      success: true,
      message: "Appointment and related prescription deleted successfully",
      deletedAppointment: appointment,
      deletedPrescription: prescription || null,
      deletedLabReport: labReport || null,
    });

  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
      error: error.message,
    });
  }
}

// Controller to handle lab report upload
async function uploadLabReport(req, res) {
  try {
    const { mrn } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // 🔼 Upload buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw", // important for PDFs!
            folder: "lab-reports", // Cloudinary folder
            public_id: mrn, // make MRN the filename
            overwrite: true, // replace if exists
            format: "pdf", // ensure PDF format
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer); // send file buffer
    });

    // 🧠 Upsert (create or update) lab report in DB
    const labReport = await Lab.findOneAndUpdate(
      { mrn },
      {
        cloudinaryId: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
      { upsert: true, new: true } // create if not found, return updated doc
    );

    // ⬇️ Update appointment with the template used
    await Appointment.findOneAndUpdate(
      { mrn },
      { labCollection: "Completed" }, // also mark appointment as Completed
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Lab report saved successfully",
      data: labReport,
    });
  } catch (error) {
    console.error("Error saving lab report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save lab report",
      error: error.message,
    });
  }
}

// Controller to open lab report file in new tab
async function getLabReport(req, res) {
  try {
    const { mrn } = req.params; // assuming route is /lab-report/:mrn

    if (!mrn) {
      return res.status(400).json({
        success: false,
        message: "MRN is required",
      });
    }

    // Check DB
    const labReport = await Lab.findOne({ mrn });
    if (!labReport) {
      return res.status(404).json({
        success: false,
        message: "Lab report not found in database",
      });
    }

    // ✅ Generate a signed inline URL
    const signedUrl = cloudinary.url(labReport.url, {
      sign_url: true,   // important for signed access
    });
    return res.redirect(signedUrl);

  } catch (error) {
    console.error("Error fetching lab report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lab report",
      error: error.message,
    });
  }
}

// Controller to open lab report file in new tab
async function verifyLabReport(req, res) {
  try {
    const { mrn } = req.params; // assuming route is /lab-report/:mrn

    if (!mrn) {
      return res.status(400).json({
        success: false,
        message: "MRN Number is required",
      });
    }

    // Check DB
    const labReport = await Lab.findOne({ mrn });
    if (!labReport) {
      return res.status(404).json({
        success: false,
        message: "Lab report not found in database",
      });
    }

    // ✅ Generate a signed inline URL
    const signedUrl = cloudinary.url(labReport.url, {
      sign_url: true,   // important for signed access
    });
    return res.redirect(signedUrl);

  } catch (error) {
    console.error("Error fetching lab report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lab report",
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
  searchAppointment,
  getPrescription,
  deleteAppointment,
  saveLabTests,
  uploadLabReport,
  getLabReport,
  verifyLabReport,
};
