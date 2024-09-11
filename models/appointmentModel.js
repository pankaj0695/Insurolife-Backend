const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Hospital = require("./hospitalModel");

const appointmentSchema = new schema(
  {
    hospital_id: {
      type: schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    doctor: {
      type: String,
    },
    date: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\d{2}-\d{2}-\d{4}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid date format! Use dd-mm-yyyy`,
      },
    },
    timing: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{2}:\d{2}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use hh:mm (24 hrs)`,
      },
    },
    userDescription: {
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

module.exports = mongoose.model("Appointment", appointmentSchema);
