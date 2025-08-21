const express = require('express');
const router = express.Router();
const { getAppointments, addAppointment } = require('../controllers/appointments');

router.post("/add-appointment", addAppointment);
router.get("/get-appointments", getAppointments);

module.exports = router;