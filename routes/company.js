const express = require("express");
const router = express.Router();
const {
  sendRequest,
  createCompany,
  loginCompany,
  createInsurance,
  pendingRequest,
  acceptedRequest,
  declinedRequest,
  updateDiscount,
  getAllAppointments,
  scheduleAppointment,
} = require("../controllers/companyController");
const { authenticateToken } = require("../helpers/helper");

router.post("/Request/Send", authenticateToken, sendRequest);
router.post("/signup", createCompany);
router.post("/login", loginCompany);
router.post("/Insurance/New", authenticateToken, createInsurance);
router.get("/Notifications/Pending", authenticateToken, pendingRequest);
router.get("/Notifications/Accepted", authenticateToken, acceptedRequest);
router.get("/Notifications/Declined", authenticateToken, declinedRequest);
router.patch("/Insurance/insurance_id", authenticateToken, updateDiscount);
router.patch("/appointments", authenticateToken, scheduleAppointment);
router.get("/appointments", authenticateToken, getAllAppointments);
module.exports = router;
