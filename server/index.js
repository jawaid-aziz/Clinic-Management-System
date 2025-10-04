const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require("dotenv").config();
const connectToMongoDB = require('./config/db');

const appointmentsRouter = require('./routes/appointments');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

connectToMongoDB(process.env.MONGO_URL)
.then(() => { console.log("Connected to Database") })
.catch((error) => { 
  console.log("Error connecting to Database: ", error);
  process.exit(1);
});

//Routes
app.use("/api/appointments", appointmentsRouter);

// Server start
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});