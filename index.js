const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const port = 4000;
const MONGODB_URI =
  "mongodb+srv://attardeayush:zHxtPZOgyoSouHGY@insurolife.mrj9r.mongodb.net/?retryWrites=true&w=majority&appName=Insurolife";
const companyRoute = require("./routes/company.js");
const hospitalRoute = require("./routes/hospital.js");
const userRoute = require("./routes/user.js");

const User = require("./models/userModel.js");
const Hospital = require("./models/hospitalModel.js");
const Company = require("./models/companyModel.js");

const generateUploadURL = require("./helpers/s3.js");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // or ['http://localhost:3000', 'https://your-production-site.com']
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

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`App Listening on the port ${port}`);
    });
  })
  .catch(console.error(), () => {
    console.log(Error);
  });
