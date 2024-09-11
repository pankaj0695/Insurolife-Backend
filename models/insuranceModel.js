const { json } = require("express");
const mongoose = require("mongoose");
const schema = mongoose.Schema;

const insuranceSchema = new schema({
  insurance_name: {
    type: String,
    required: true,
  },
  claim: {
    type: Number,
    required: true,
  },
  compatibility: {
    type: String,
    required: true,
  },
  emi: {
    type: Number,
    required: true,
  },
  discounted_emi: {
    type: Number,
  },
  discount: {
    type: Number,
    default: 0,
    validate: {
      validator: function (v) {
        return v >= 0 && v < 100;
      },
      message: (props) =>
        `${props.value} is not a valid discount value. Enter a value between 0 and 100`,
    },
  },
});

insuranceSchema.statics.applyDiscount = async function (
  insurance_id,
  discount
) {
  const insurance = await this.findOne({ _id: insurance_id });
  if (!insurance) {
    throw Error("Insurance ID doesn't exist");
  }
  insurance.discount = discount;
  insurance.discounted_emi = insurance.emi * (1 - insurance.discount / 100);
  await insurance.save();
  return insurance;
};
module.exports = mongoose.model("Insurance", insuranceSchema);
