const express = require("express");
const router = express.Router();
const {
  getInsurance,
  createHospital,
  loginHospital,
  acceptOrDeclineRequest,
  getAllRequests,
} = require("../controllers/hospitalController");
const { authenticateToken } = require("../helpers/helper");

router.post("/signup", createHospital);
router.post("/login", loginHospital);
router.patch("/notifications", authenticateToken, acceptOrDeclineRequest);
router.get("/get-requests", authenticateToken, getAllRequests);

router.get("/get-insurances", authenticateToken, getInsurance);

module.exports = router;
