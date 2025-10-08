const express = require('express');
const router = express.Router();
const { addAppointment,
    pendingAppointments,
    historyAppointments,
    getAppointmentData,
    updateAppointmentTime,
    uploadPrescription,
    upload,
    searchAppointment,
    getPrescription,
    deleteAppointment,
    saveLabTests,
    uploadLabReport,
    getLabReport,
} = require('../controllers/appointments');

router.post("/add", addAppointment);
router.get("/pending", pendingAppointments);
router.get("/history", historyAppointments);
router.get("/search", searchAppointment);
router.post("/delete", deleteAppointment);
router.get("/:id", getAppointmentData);
router.post("/:id/saveLabTests", saveLabTests);
router.put("/:id/time", updateAppointmentTime);
router.post("/prescription", upload.single("file"), uploadPrescription);
router.post("/labReport", upload.single("file"), uploadLabReport);
router.get("/search", searchAppointment);
router.get("/openPrescription/:mrn", getPrescription);
router.get("/openLabReport/:mrn", getLabReport);

module.exports = router;