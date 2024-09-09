const express = require("express");
const router = express.Router();
const {
  createUser,
  getNearbyHospital,
} = require("../controllers/userController");

router.post("/", createUser);
router.get("/user_id", getNearbyHospital);

module.exports = router;
