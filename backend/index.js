const express = require('express');
const mongoose = require('mongoose');
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const process = require("process");
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

dotenv.config();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev"));

//convert data into json format
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// CORS
app.use(cors());

// MONGODB CONNECTION
if (!process.env.MONGODB_URI) {
  throw Error("Database connection string not found");
}
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Succesfully connected to MongoDB");
  }).catch((err) => {
    console.log("Failed to connect to MongoDB");
    console.log(err);
  });

// IMPORT MODEL
const AccountRouter = require("./api/routes/accountRoutes.js");
const RecordRouter = require("./api/routes/recordRoutes.js");

// ROUTES
app.get("/", (req, res) => {
  res.send("Kelompok 13 Backend Service");
});
// app.use("/user", require("./api/routes/UserRoutes"));
app.use("/api/accounts", AccountRouter);  // Menggunakan FilmRouter untuk route terkait film
app.use("/api/records", RecordRouter);

// APP START
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
