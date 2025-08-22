const express = require('express');
const router = express.Router();
const { addAppointment,
    pendingAppointments,
    historyAppointments, } = require('../controllers/appointments');

router.post("/add-appointment", addAppointment);
router.get("/get-appointments", pendingAppointments);
router.get("/get-history-appointments", historyAppointments);

module.exports = router;