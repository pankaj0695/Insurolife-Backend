const express = require("express");
const router = express.Router();
const {
  getInsurance,
  createHospital,
  acceptOrDeclineRequest,
  getAllRequests,
  getAllAppointments,
  acceptOrDeclineAppointment,
} = require("../controllers/hospitalController");

router.post("/signup", createHospital);
router.patch("/notifications", acceptOrDeclineRequest);
router.get("/notifications", getAllRequests);
router.patch("/appointments", acceptOrDeclineAppointment);
router.get("/appointments", getAllAppointments);
router.get("/:hospital_name", getInsurance);

module.exports = router;
