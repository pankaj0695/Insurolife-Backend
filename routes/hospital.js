const express = require("express");
const router = express.Router();
const {
  getInsurance,
  createHospital,
  acceptOrDeclineRequest,
  getAllRequests,
  acceptOrDeclineAppointment,
} = require("../controllers/hospitalController");

router.post("/", createHospital);
router.patch("/notifications", acceptOrDeclineRequest);
router.get("/notifications", getAllRequests);
router.get("/:hospital_name", getInsurance);
router.patch("/appointment-request", acceptOrDeclineAppointment);
module.exports = router;
