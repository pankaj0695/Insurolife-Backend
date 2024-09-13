const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  getNearbyHospital,
  bookAppointment,
  giveRatings,
} = require("../controllers/userController");
const { authenticateToken } = require("../helpers/helper");

router.post("/signup", createUser);
router.post("/login", loginUser);
router.post("/hospital-id/ratings", authenticateToken, giveRatings);
router.get("/user-id", authenticateToken, getNearbyHospital);
router.post("/user-id/book-appointment", authenticateToken, bookAppointment);

module.exports = router;
