const db = require("../config/db");

async function addAppointment(req, res) {
  try {
    const {
      mrn,
      name,
      sex,
      age,
      doctor,
      cnic,
      contact,
      date,
      time,
      weight,
      height,
      bp,
      pulse,
      temperature,
      vco,
      gestation,
    } = req.body;

    // 1. Insert patient (always create new history entry with status=pending)
    const insertPatient = db.prepare(`
      INSERT INTO patients (mrn, name, sex, age, doctor, cnic, contact, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    const result = insertPatient.run(
      mrn, name, sex, age, doctor, cnic, contact
    );

    const patientId = result.lastInsertRowid;

    // 2. Insert appointment (linked to patient)
    const insertAppointment = db.prepare(`
      INSERT INTO appointments 
      (patient_id, date, time, weight, height, bp, pulse, temperature, vco, gestation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAppointment.run(
      patientId, date, time, weight, height, bp, pulse, temperature, vco ? 1 : 0, gestation
    );

    res.status(201).json({ message: "Appointment booked ✅", patientId });
  } catch (err) {
    console.error("Error adding appointment:", err.message);
    res.status(500).json({ error: "Failed to add appointment" });
  }
};

// Complete appointment (update patient, delete appointment)
async function completeAppointment(req, res) {
  try {
    const { patientId } = req.params;

    // 1. Update patient status → completed
    const updatePatient = db.prepare(`
      UPDATE patients SET status = 'completed' WHERE id = ?
    `);
    updatePatient.run(patientId);

    // 2. Delete appointment
    const deleteAppt = db.prepare(`
      DELETE FROM appointments WHERE patient_id = ?
    `);
    deleteAppt.run(patientId);

    res.json({ message: "Appointment marked completed ✅" });
  } catch (err) {
    console.error("Error completing appointment:", err.message);
    res.status(500).json({ error: "Failed to complete appointment" });
  }
};

// Get all appointments (only pending)
async function getAppointments (req, res) {
  const rows = db.prepare(`
    SELECT a.id, p.name, p.mrn, p.doctor, a.date, a.time, p.status
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
  `).all();

  res.json(rows);
};

// Get patient history
async function getPatients(req, res) {
  const rows = db.prepare(`SELECT * FROM patients`).all();
  res.json(rows);
};

module.exports = {
  addAppointment,
  completeAppointment,
  getAppointments,
  getPatients
}