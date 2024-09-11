const express = require("express");
const router = express.Router();
const {
  createUser,
  getNearbyHospital,
  bookAppointment,
} = require("../controllers/userController");

router.post("/", createUser);
router.get("/user_id", getNearbyHospital);
router.post("/user_id/book-appointment", bookAppointment);

module.exports = router;
