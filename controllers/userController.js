const User = require("../models/userModel");
const Hospital = require("../models/hospitalModel");
const Appointment = require("../models/appointmentModel");
//This is a comment
const createUser = async (req, res) => {
  const { name, dob, email, location } = req.body;
  const emptyFields = [];
  if (!name) {
    emptyFields.push("Name");
  }
  if (!dob) {
    emptyFields.push("DOB");
  }
  if (!email) {
    emptyFields.push("Email");
  }
  if (!location) {
    emptyFields.push("Location");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ message: "Please Enter in all the Fields", emptyFields });
  }

  const existingEmail = await User.find({ email });
  if (existingEmail.length !== 0) {
    return res.status(400).json({ message: "Email is already registered" });
  }

  try {
    const user = await User.create({ name, dob, email, location });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getNearbyHospital = async (req, res) => {
  const { email, location } = req.body;
  //For user's location
  if (!location) {
    if (!email) {
      res.status(400).json({ message: "Some Error Occured" });
    }
    const userLocation = (
      await User.findOne({ email }, { location: 1, _id: 0 })
    ).location;
    if (!userLocation) {
      res.status(400).json({ message: "Some Error Occured" });
    }
    const nearbyHospitals = await Hospital.find({ location: userLocation });
    if (nearbyHospitals.length === 0) {
      return res
        .status(200)
        .json({ message: "No Registered Hospitals in your area" });
    }
    res.status(200).json(nearbyHospitals);
  }
  //for location provided through filter
  else {
    if (!location) {
      res.status(400).json({ message: "Some Error Occured" });
    }
    const nearbyHospitals = await Hospital.find({ location });
    if (nearbyHospitals.length === 0) {
      return res
        .status(200)
        .json({ message: "No Registered Hospitals in the area" });
    }
    res.status(200).json(nearbyHospitals);
  }
};
const bookAppointment = async (req, res) => {
  //User will select timing
  //User will provide description
  //Appointment request will be sent
  //Hospital will provide date and request will be accepted
  //Hospital will allot a Doctor(Doctor Details Not Stored in db)

  const { user_id, hospital_id, timing, desc } = req.body;
  const emptyFields = [];
  if (!user_id) {
    emptyFields.push("User ID");
  }
  const { appointments } = await User.findById(user_id, {
    appointments: 1,
    _id: 0,
  });
  if (appointments && appointments.status !== "Declined") {
    return res
      .status(400)
      .json({ message: "An Appointment is already booked" });
  }
  if (!hospital_id) {
    emptyFields.push("Hospital ID");
  }
  if (!timing) {
    emptyFields.push("Timing");
  }
  if (!desc) {
    emptyFields.push("Description");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ message: "Please Enter in all the Fields", emptyFields });
  }
  const hospital = await Hospital.findById(hospital_id);
  if (!hospital) {
    return res.status(400).json({ message: "Hospital Doesn't Exist" });
  }
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(400).json({ message: "User Doesn't Exist" });
  }
  const status = "Pending";
  const newAppointment = await Appointment.create({
    hospital_id,
    timing,
    userDescription: desc,
    status,
  });

  if (!newAppointment) {
    return res.status(500).json({ message: "Some Error Occured" });
  }
  res.status(200).json(newAppointment);

  await User.findByIdAndUpdate(user_id, { appointments: newAppointment });
};

module.exports = { createUser, getNearbyHospital, bookAppointment };
