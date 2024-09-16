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
  },
  email: {
    type: String,
  },
});

module.exports = mongoose.model("Counselor", counsellorSchema);
