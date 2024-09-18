const mongoose = require("mongoose");
const schema = mongoose.Schema;

const insuranceSchema = new schema({
  company_id: {
    type: schema.Types.ObjectId,
    ref: "Company",
    // required: true,
  },
  insurance_name: {
    type: String,
    required: true,
  },
  insurer: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  claim: {
    type: Number,
    required: true,
  },
  premium: {
    type: Number,
    required: true,
  },
  tags: [{ type: String }],
  description: {
    type: String,
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
