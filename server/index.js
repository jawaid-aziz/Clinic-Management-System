const express = require('express');
const cors = require('cors');

const appointmentsRouter = require('./routes/appointments');
const patientsRouter = require('./routes/patients');
const templatesRouter = require('./routes/templates');

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

//Routes
app.use("/api/appointments", appointmentsRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/templates", templatesRouter);

// Server start
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

