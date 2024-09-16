const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  getNearbyHospital,
  bookAppointment,
  giveRatings,
  getAllInsurance,
  getAllCompanies,
} = require("../controllers/userController");
const { authenticateToken } = require("../helpers/helper");

router.post("/signup", createUser);
router.post("/login", loginUser);
router.post("/hospital-id/ratings", authenticateToken, giveRatings);
router.get("/user-id/hospitals", authenticateToken, getNearbyHospital);
router.get("/user-id/insurance", authenticateToken, getAllInsurance);
router.get("/user-id/companies", authenticateToken, getAllCompanies);
router.post("/user-id/book-appointment", authenticateToken, bookAppointment);

module.exports = router;
