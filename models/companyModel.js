const mongoose = require("mongoose");
const schema = mongoose.Schema;

const companySchema = new schema({
  company_name: {
    type: String,
    required: true,
    unique: true,
  },
  insurance_offered_id: {
    type: String,
  },
});
module.exports = mongoose.model("Company", companySchema);
