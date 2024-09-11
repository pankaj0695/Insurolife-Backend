const Hospital = require("../models/hospitalModel");
const Request = require("../models/insuranceRequestModel");
const Insurance = require("../models/insuranceModel");
const mongoose = require("mongoose");

//gets all insurance accepted by hospital
const getInsurance = async (req, res) => {
  try {
    const hospital_name = req.params.hospital_name;

    const hospitals = await Hospital.find({ hospital_name }, { _id: 1 });
    const hospital_ids = hospitals.map((hospital) => hospital._id);
    if (hospital_ids.length === 0) {
      return res.status(404).json({ message: "Hospital Does not Exist" });
    }

    const requests = await Request.find(
      { hospital_id: { $in: hospital_ids }, status: "Accepted" },
      { insurance_id: 1 }
    );

    if (requests.length === 0) {
      return res.status(200).json({ message: "No Insurance Approved Yet" });
    }

    const insurance_ids = requests.map((request) => request.insurance_id);

    const insurances = await Insurance.find({ _id: { $in: insurance_ids } });

    if (insurances.length === 0) {
      return res.status(404).json({ message: "Insurance Not Found" });
    }

    res.status(200).json(insurances);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Create a Hospital profile
const createHospital = async (req, res) => {
  const { hospital_name, location } = req.body;
  let emptyFields = [];
  if (!hospital_name) {
    emptyFields.push("Hospital Name");
  }
  if (!location) {
    emptyFields.push("Location");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields ", emptyFields });
  }

  //adding to db
  try {
    const hospital = await Hospital.create({ hospital_name, location });
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

    const allRequests = await Request.find({ _id: { $in: hospital.requests } });

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

const getAllAppointments = async (req, res) => {};
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
