require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

const companyRoute = require("../routes/company.js");
const hospitalRoute = require("../routes/hospital.js");
const userRoute = require("../routes/user.js");

const User = require("../models/userModel.js");
const Hospital = require("../models/hospitalModel.js");
const Company = require("../models/companyModel.js");

const generateUploadURL = require("../helpers/s3.js");

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://insurolife.vercel.app"],
    credentials: false,
  })
);

app.use("/customer", userRoute);
app.use("/insurer", companyRoute);
app.use("/hospital", hospitalRoute);

app.post("/user", async (req, res) => {
  const { role, id } = req.body;
  switch (role) {
    case "customer":
      const user = await User.findById(id);
      if (!user) {
        return res.status(200).json({ message: "User Not Found" });
      }
      res.status(200).json(user);
      break;

    case "insurer":
      const company = await Company.findById(id);
      if (!company) {
        return res.status(200).json({ message: "Company Not Found" });
      }
      res.status(200).json(company);
      break;
    case "hospital":
      const hospital = await Hospital.findById(id);
      if (!hospital) {
        return res.status(200).json({ message: "Hospital Not Found" });
      }
      res.status(200).json(hospital);
      break;
    default:
      res.status(400).json({ message: "Invalid Choice" });
      break;
  }
});

app.post("/s3url", async (req, res) => {
  const { imgExtension } = req.body;
  const url = await generateUploadURL(imgExtension);
  res.send({ url });
});

// Connect to DB only once (cache workaround for Vercel serverless)
let isConnected = false;
async function connectDB() {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
  }
}

module.exports = async (req, res) => {
  await connectDB(); // must await DB connect before anything else
  return app(req, res); // Express handles the route
};
