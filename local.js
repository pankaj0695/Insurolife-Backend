require("dotenv").config();
const mongoose = require("mongoose");
const { app } = require("./api/index");

const PORT = 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running locally on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });
