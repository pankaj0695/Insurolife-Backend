const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Request = require("./insuranceRequestModel");

const hospitalSchema = new schema({
  hospital_name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  insurance_id: {
    type: String,
  },
  requests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
    },
  ],
});

module.exports = mongoose.model("Hospital", hospitalSchema);
