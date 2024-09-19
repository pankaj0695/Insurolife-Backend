const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Basic validation for dd-mm-yyyy format
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid date format! Use dd-mm-yyyy`,
    },
  },
  email: {
    type: String,
    required: true,
  },
  contactNo: {
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
  password: {
    type: String,
    required: true,
  },
  medical_records: [
    {
      date: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            // Basic validation for dd-mm-yyyy format
            return /^\d{4}-\d{2}-\d{2}$/.test(v);
          },
          message: (props) =>
            `${props.value} is not a valid date format! Use dd-mm-yyyy`,
        },
      },
      image: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
