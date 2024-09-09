const express = require("express");
const router = express.Router();
const {
  sendRequest,
  createCompany,
  createInsurance,
} = require("../controllers/companyController");

router.post("/Request/Send", sendRequest);
router.post("/Create", createCompany);
router.post("/Insurance/New", createInsurance);
module.exports = router;
