const express = require('express');
const router = express.Router();
const { addAppointment,
    pendingAppointments,
    historyAppointments,
    getAppointmentData
} = require('../controllers/appointments');

router.post("/add", addAppointment);
router.get("/pending", pendingAppointments);
router.get("/history", historyAppointments);
router.get("/:id", getAppointmentData);
module.exports = router;