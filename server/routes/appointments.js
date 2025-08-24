const express = require('express');
const router = express.Router();
const { addAppointment,
    pendingAppointments,
    historyAppointments,
    getAppointmentData,
    updateAppointmentTime,
    uploadPrescription,
    upload
} = require('../controllers/appointments');

router.post("/add", addAppointment);
router.get("/pending", pendingAppointments);
router.get("/history", historyAppointments);
router.get("/:id", getAppointmentData);
router.put("/:id/time", updateAppointmentTime);
router.post("/prescription", upload.single("file"), uploadPrescription);

module.exports = router;