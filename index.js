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
const session = require("express-session");
const generateUploadURL = require("./helpers/s3.js");

app.use(express.json());
app.use(cors());

app.use("/customer", userRoute);
app.use("/insurer", companyRoute);
app.use("/hospital", hospitalRoute);
app.use(
  session({
    secret: "G4A88G4AL",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to `true` in production with HTTPS
  })
);

app.post("/s3url", async (req, res) => {
  const { imgExtension } = req.body;
  const url = await generateUploadURL(imgExtension);
  res.send({ url });
});

app.get("/zoom/call", async (req, res) => {
  const code = req.query.code; // Capture the authorization code
  console.log(code);
  if (!code) {
    return res.status(400).json({ message: "No authorization code found." });
  }
  res.redirect("/insurer/appointments");
});
app.get("/zoom/auth", (req, res) => {
  res.redirect(process.env.ZOOM_AUTHORIZE_URI);
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
