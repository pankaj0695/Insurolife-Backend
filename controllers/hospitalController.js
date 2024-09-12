const Hospital = require("../models/hospitalModel");
const Request = require("../models/insuranceRequestModel");
const Insurance = require("../models/insuranceModel");
const mongoose = require("mongoose");

//gets all insurance which are accepted by hospital
const getInsurance = async (req, res) => {
  const { hospital_id } = req.body;
  if (!hospital_id) {
    return res.status(400).json({ message: "Please provide Hospital ID" });
  }
  try {
    const requests = await Request.find({ hospital_id, status: "Accepted" });
    const insurance_ids = requests.map((request) => request.insurance_id);
    if (insurance_ids.length === 0) {
      res.status(404).json({ message: "No Insurances Accepted" });
    }
    const insurances = await Insurance.find({ _id: { $in: insurance_ids } });
    return res.status(200).json(insurances);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//Create a Hospital profile
const createHospital = async (req, res) => {
  const { hospital_name, city, state } = req.body;
  let emptyFields = [];
  if (!hospital_name) {
    emptyFields.push("Hospital Name");
  }
  if (!city) {
    emptyFields.push("city");
  }
  if (!state) {
    emptyFields.push("state");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields ", emptyFields });
  }

  //adding to db
  try {
    const existingHospital = await Hospital.findOne({
      hospital_name,
      city,
      state,
    });
    if (existingHospital) {
      return res
        .status(400)
        .json({ message: "This Hospital Branch already exists" });
    }
    const hospital = await Hospital.create({ hospital_name, city, state });
    res.status(200).json(hospital);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Display all requests
const getAllRequests = async (req, res) => {
  const { hospital_id } = req.body;

  try {
    const hospital = await Hospital.findById(hospital_id).select("requests");

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    if (!hospital.requests || hospital.requests.length === 0) {
      return res
        .status(404)
        .json({ message: "No requests found in the request history" });
    }

    const allRequests = await Request.find({
      _id: { $in: hospital.requests },
    }).sort({ createdAt: -1 });

    if (!allRequests || allRequests.length === 0) {
      return res.status(404).json({ message: "No requests found" });
    }

    res.status(200).json(allRequests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Some error occurred", error: error.message });
  }
};

//Operate on the insurance request
const acceptOrDeclineRequest = async (req, res) => {
  try {
    const { _id, status } = req.body;
    if (!_id) {
      return res.status(404).json({ message: "Request Does not Exist" });
    }
    if (!status || (status != "Accepted" && status != "Declined")) {
      return res.status(400).json({ message: "Invalid Status" });
    }
    const updateRequest = await Request.findByIdAndUpdate(
      _id,
      {
        status: status,
      },
      { new: true }
    );

    if (!updateRequest) {
      return res.status(404).json({ message: "Request Does not Exist" });
    }
    // const request = Request.findByIdAndUpdate(_id, acceptedRequest);
    res.status(200).json({ updateRequest });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Incomplete Appointment Function
const getAllAppointments = async (req, res) => {};

//Incomplete Appointment Function
const acceptOrDeclineAppointment = async (req, res) => {
  //User will select timing
  //User will provide description
  //Appointment request will be sent
  //Hospital will either accept or decline the appointment request
  //If declines then a message will be provided
  //Hospital will provide date and request will be accepted
  //Hospital will allot a Doctor(Doctor Details Not Stored in db)
  const { hospital_id, status } = req.body;
};

module.exports = {
  getInsurance,
  createHospital,
  acceptOrDeclineRequest,
  getAllRequests,
  getAllAppointments,
  acceptOrDeclineAppointment,
};
