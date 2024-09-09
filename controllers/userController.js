const User = require("../models/userModel");
const Hospital = require("../models/hospitalModel");
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
  if (existingEmail) {
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

module.exports = { createUser, getNearbyHospital };
