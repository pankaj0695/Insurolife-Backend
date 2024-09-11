const mongoose = require("mongoose");
const schema = mongoose.Schema;

const ratingSchema = new schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hospital_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return v >= 0 && v <= 5;
      },
      message: (props) =>
        `${props.value} is not a valid rating. It must be between 0 and 5`,
    },
  },
});

module.exports = mongoose.model("Rating", ratingSchema);
