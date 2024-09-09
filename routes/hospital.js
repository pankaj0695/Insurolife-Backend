const express = require("express");
const router = express.Router();
const {
  getInsurance,
  createHospital,
  acceptOrDeclineRequest,
  getAllRequests,
} = require("../controllers/hospitalController");

router.post("/", createHospital);
router.patch("/notifications", acceptOrDeclineRequest);
router.get("/notifications", getAllRequests);
router.get("/:hospital_name", getInsurance);
module.exports = router;
