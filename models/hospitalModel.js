const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Request = require("./insuranceRequestModel");

const hospitalSchema = new schema({
  hospital_name: {
    type: String,
    required: true,
  },
  image: {
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
  insurance_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Insurance",
    },
  ],
  requests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
    },
  ],
  email: {
    type: String,
    required: true,
  },
  contactNo: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  ratingCount: {
    type: Number,
    default: 5,
  },
  avgRating: {
    type: Number,
    default: 4,
  },
});

module.exports = mongoose.model("Hospital", hospitalSchema);
