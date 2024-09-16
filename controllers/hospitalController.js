const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Hospital = require("../models/hospitalModel");
const User = require("../models/userModel");
const Request = require("../models/insuranceRequestModel");
const Insurance = require("../models/insuranceModel");
const Appointment = require("../models/appointmentModel");
const { SECRET_KEY } = require("../helpers/helper");

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
  const { hospital_name, city, state, email, password } = req.body;
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
  if (!email) {
    emptyFields.push("Email");
  }
  if (!password) {
    emptyFields.push("Password");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields ", emptyFields });
  }

  //adding to db
  try {
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const hospital = await Hospital.create({
      hospital_name,
      city,
      state,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ name: hospital_name }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ hospital, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginHospital = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please Enter In All The Fields" });
  }
  try {
    const hospital = await Hospital.findOne({ email });
    if (!hospital) {
      return res.status(403).json({ message: "Email is Invalid" });
    }

    const validPassword = await bcrypt.compare(password, hospital.password);
    if (!validPassword) {
      return res.status(403).send("Invalid password");
    }
    const token = jwt.sign({ name: hospital.hospital_name }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ hospital, token });
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

//Not to be used Functions!!!!
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
  loginHospital,
  acceptOrDeclineRequest,
  getAllRequests,
  getAllAppointments,
  acceptOrDeclineAppointment,
};
