const express = require('express');
const router = express.Router();
const { addAppointment,
    pendingAppointments,
    historyAppointments, } = require('../controllers/appointments');

router.post("/add", addAppointment);
router.get("/pending", pendingAppointments);
router.get("/history", historyAppointments);

module.exports = router;