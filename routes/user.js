const express = require("express");
const router = express.Router();
const {
  createUser,
  getNearbyHospital,
  bookAppointment,
  giveRatings,
} = require("../controllers/userController");

router.post("/signup", createUser);
router.post("/hospital_id/ratings", giveRatings);
router.get("/user_id", getNearbyHospital);
router.post("/user_id/book-appointment", bookAppointment);

module.exports = router;
