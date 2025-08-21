const Database = require("better-sqlite3");

const db = new Database("./appointments/appointments.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mrn TEXT,
    name TEXT,
    sex TEXT,
    age INTEGER,
    doctor TEXT,
    cnic TEXT,
    contact TEXT,
    status TEXT DEFAULT 'pending', -- pending | completed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    date TEXT,
    time TEXT,
    weight TEXT,
    height TEXT,
    bp TEXT,
    pulse TEXT,
    temperature TEXT,
    vco BOOLEAN,
    gestation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  )
`);

module.exports = db;