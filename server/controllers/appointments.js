const Appointment = require("../models/appointment");

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

module.exports = {
  addAppointment,
  pendingAppointments,
  historyAppointments,
};
