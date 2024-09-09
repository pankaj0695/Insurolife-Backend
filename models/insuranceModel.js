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
  discount: {
    type: Number,
  },
});

insuranceSchema.statics.applyDiscount = async function (insurance_name) {
  const insurance = await this.findBy(insurance_name);
  if (!insurance.discount) {
    return;
  }
  insurance.emi = insurance.emi * (1 - insurance.discount / 100);
  await insurance.save();
  return insurance;
};
module.exports = mongoose.model("Insurance", insuranceSchema);
