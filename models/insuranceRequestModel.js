const mongoose = require("mongoose");

const schema = mongoose.Schema;

const requestSchema = new schema(
  {
    hospital_id: {
      type: String,
      required: true,
    },
    company_id: {
      type: String,
      required: true,
    },
    insurance_id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
