const express = require("express");
const router = express.Router();
const {
  getInsurance,
  createHospital,
  loginHospital,
  acceptOrDeclineRequest,
  getAllRequests,
  getAllAppointments,
  acceptOrDeclineAppointment,
} = require("../controllers/hospitalController");
const { authenticateToken } = require("../helpers/helper");

router.post("/signup", createHospital);
router.post("/login", loginHospital);
router.patch("/notifications", authenticateToken, acceptOrDeclineRequest);
router.get("/notifications", authenticateToken, getAllRequests);
router.patch("/appointments", authenticateToken, acceptOrDeclineAppointment);
router.get("/appointments", authenticateToken, getAllAppointments);
router.get("/:hospital_name", authenticateToken, getInsurance);

module.exports = router;
