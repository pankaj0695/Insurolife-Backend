const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Request = require("./insuranceRequestModel");

const hospitalSchema = new schema({
  hospital_name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
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
  ratingCount: {
    type: Number,
    default: 0,
  },
  avgRating: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Hospital", hospitalSchema);
