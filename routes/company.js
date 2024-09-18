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
  markAsDone,
  getAllCounsellor,
  newCounsellor,
} = require("../controllers/companyController");
const { authenticateToken } = require("../helpers/helper");

router.post("/request/send", authenticateToken, sendRequest);
router.post("/signup", createCompany);
router.post("/login", loginCompany);
router.post("/insurance/new", authenticateToken, createInsurance);
router.get("/notifications/pending", authenticateToken, pendingRequest);
router.get("/notifications/accepted", authenticateToken, acceptedRequest);
router.get("/notifications/declined", authenticateToken, declinedRequest);
router.patch("/insurance/insurance_id", authenticateToken, updateDiscount);
router.patch("/appointments", authenticateToken, scheduleAppointment);
router.get("/appointments", authenticateToken, getAllAppointments);
router.patch("/appointments/approved", authenticateToken, markAsDone);
router.get("/counsellor", authenticateToken, getAllCounsellor);
router.post("/counsellor", authenticateToken, newCounsellor);
module.exports = router;
