const express = require('express');
const router = express.Router();
const { addAppointment,
    pendingAppointments,
    historyAppointments,
    getAppointmentData,
    updateAppointmentTime,
    uploadPrescription,
    upload,
    searchAppointment
} = require('../controllers/appointments');

router.post("/add", addAppointment);
router.get("/pending", pendingAppointments);
router.get("/history", historyAppointments);
router.get("/search", searchAppointment);
router.get("/:id", getAppointmentData);
router.put("/:id/time", updateAppointmentTime);
router.post("/prescription", upload.single("file"), uploadPrescription);
router.get("/search", searchAppointment);

module.exports = router;