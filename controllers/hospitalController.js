const Hospital = require("../models/hospitalModel");
const User = require("../models/userModel");
const Request = require("../models/insuranceRequestModel");
const Insurance = require("../models/insuranceModel");
const Appointment = require("../models/appointmentModel");

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

//Complete Appointment Function
const getAllAppointments = async (req, res) => {
  const { hospital_id } = req.body;
  if (!hospital_id) {
    return res.status(400).json({ message: "Please provide Hospital ID" });
  }

  try {
    const appointments = await Appointment.find({ hospital_id });

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No Appointments Found" });
    }

    const appointmentDetails = await Promise.all(
      appointments.map(async (appointment) => {
        const user = await User.findOne({ _id: appointment.user_id });

        return {
          appointment,
          user: user || null,
        };
      })
    );

    res.status(200).json({ appointmentDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Incomplete Appointment Function
const acceptOrDeclineAppointment = async (req, res) => {
  //User will select timing
  //User will provide description
  //Appointment request will be sent
  //Hospital will either accept or decline the appointment request
  //If declines then a message will be provided
  //Hospital will provide date and request will be accepted
  //Hospital will allot a Doctor(Doctor Details Not Stored in db)
  const { hospital_id, appointment_id, status, date } = req.body;
  if (!hospital_id) {
    return res.status(400).json({ message: "Error in selecting the hospital" });
  }
  if (!appointment_id) {
    return res.status(404).json({ message: "No Appointment" });
  }
  if (!status) {
    return res.status(400).json({ message: "Select Accept or Decline" });
  }
  if (!date) {
    return res.status(400).json({ message: "Select A Date" });
  }

  try {
    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital Not Found" });
    }
    const appointment = await Appointment.findOne({
      _id: appointment_id,
      status: "Pending",
    });
    if (!appointment) {
      return res.status(404).json({ message: "No Appointments" });
    }
    switch (status) {
      case "Accept":
        await Appointment.findByIdAndUpdate(appointment_id, {
          status: "Accepted",
          date,
        });
        appointment.status = "Accepted";

        break;
      case "Decline":
        await Appointment.findByIdAndUpdate(appointment_id, {
          status: "Declined",
        });
        appointment.status = "Declined";
        break;
      default:
        return res.status(400).json({ message: "Invalid Status" });
    }
    return res.status(200).json(appointment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getInsurance,
  createHospital,
  acceptOrDeclineRequest,
  getAllRequests,
  getAllAppointments,
  acceptOrDeclineAppointment,
};
