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

router.post("/", createHospital);
router.patch("/notifications", acceptOrDeclineRequest);
router.get("/notifications", getAllRequests);
router.get("/:hospital_name", getInsurance);
router.patch("/appointments", acceptOrDeclineAppointment);
router.get("/appointments",getAllAppointments)
module.exports = router;
