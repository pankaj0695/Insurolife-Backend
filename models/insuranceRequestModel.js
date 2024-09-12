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
      validate: {
        validator: function (v) {
          return v === "Accepted" || v === "Declined" || v === "Pending";
        },
        message: (props) =>
          `${props.value} is not a valid Status! Use Accepted Declined or Pending`,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
