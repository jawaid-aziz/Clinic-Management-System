import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const appointmentsRouter = require("./routes/appointments");
const patientsRouter = require("./routes/patients");
const templatesRouter = require("./routes/templates");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/api/appointments", appointmentsRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/templates", templatesRouter);

// Server start
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

