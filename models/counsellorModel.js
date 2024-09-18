const mongoose = require("mongoose");
const schema = mongoose.Schema;

const counsellorSchema = new schema({
  name: {
    type: String,
    required: true,
  },
  company_id: {
    type: schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  description: [
    {
      type: String,
    },
  ],
  phone_no: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Counsellor", counsellorSchema);
