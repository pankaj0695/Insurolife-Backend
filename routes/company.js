const express = require("express");
const router = express.Router();
const {
  sendRequest,
  createCompany,
  createInsurance,
  pendingRequest,
  acceptedRequest,
  declinedRequest,
} = require("../controllers/companyController");

router.post("/Request/Send", sendRequest);
router.post("/Create", createCompany);
router.post("/Insurance/New", createInsurance);
router.get("/Notifications/Pending", pendingRequest);
router.get("/Notifications/Accepted", acceptedRequest);
router.get("/Notifications/Declined", declinedRequest);
module.exports = router;
