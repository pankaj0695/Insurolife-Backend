const mongoose = require("mongoose");
const schema = mongoose.Schema;

const companySchema = new schema({
  company_name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  contactNo: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Company", companySchema);
