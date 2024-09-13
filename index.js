const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const port = 4000;
const MONGODB_URI =
  "mongodb+srv://attardeayush:zHxtPZOgyoSouHGY@insurolife.mrj9r.mongodb.net/?retryWrites=true&w=majority&appName=Insurolife";
const companyRoute = require("./routes/company.js");
const hospitalRoute = require("./routes/hospital.js");
const userRoute = require("./routes/user.js");

app.use(express.json());
app.use(cors());

app.use("/user", userRoute);
app.use("/company", companyRoute);
app.use("/hospital", hospitalRoute);

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
