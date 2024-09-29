const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Hospital = require("../models/hospitalModel");
const Request = require("../models/insuranceRequestModel");
const Insurance = require("../models/insuranceModel");
const { SECRET_KEY } = require("../helpers/helper");

//gets all insurance which are accepted by hospital
const getInsurance = async (req, res) => {
  const { hospital_id } = req.body;
  if (!hospital_id) {
    return res.status(400).json({ message: "Please provide Hospital ID" });
  }
  try {
    const hospital = await Hospital.findById(hospital_id);
    const insurance_ids = hospital.insurance_id;
    const insurances = await Promise.all(
      insurance_ids.map(async (insurance_id) => {
        const insurance = await Insurance.findById(insurance_id);
        return insurance;
      })
    );
    res.status(200).json(insurances);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//Create a Hospital profile
const createHospital = async (req, res) => {
  const { hospital_name, image, city, state, email, contactNo, password } =
    req.body;
  let emptyFields = [];
  if (!hospital_name) {
    emptyFields.push("Hospital Name");
  }
  if (!image) {
    emptyFields.push("Image");
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
  if (!contactNo) {
    emptyFields.push("ContactNo");
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
      image,
      city,
      state,
      email,
      contactNo,
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
    const hospital = await Hospital.findById(hospital_id);

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

    const updatedRequest = await Promise.all(
      allRequests.map(async (request) => {
        const insurance = await Insurance.findById(request.insurance_id);
        const insurance_name = insurance.insurance_name;
        return {
          ...request,
        };
      })
    );

    res.status(200).json(allRequests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Some error occurred", error: error.message });
  }
};

const acceptOrDeclineRequest = async (req, res) => {
  try {
    const { request_id, status } = req.body;

    if (!request_id) {
      return res.status(404).json({ message: "Request Does Not Exist" });
    }
    if (!status || (status !== "Accepted" && status !== "Declined")) {
      return res.status(400).json({ message: "Invalid Status" });
    }

    const request = await Request.findById(request_id);
    if (!request) {
      return res.status(404).json({ message: "Request Not Found" });
    }

    const hospital = await Hospital.findById(request.hospital_id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital Not Found" });
    }

    if (status === "Accepted") {
      if (!hospital.insurance_id.includes(request.insurance_id)) {
        hospital.insurance_id.push(request.insurance_id);
      } else {
        return res.status(400).json({ message: "Insurance already added" });
      }
    }
    await hospital.save();

    const updatedRequest = await Request.findByIdAndUpdate(
      request_id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request Not Found" });
    }

    res.status(200).json({ updatedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Not to be used Functions!!!!
//Complete Appointment Function
// const getAllAppointments = async (req, res) => {
//   const { hospital_id } = req.body;
//   if (!hospital_id) {
//     return res.status(400).json({ message: "Please provide Hospital ID" });
//   }

//   try {
//     const appointments = await Appointment.find({ hospital_id });

//     if (appointments.length === 0) {
//       return res.status(404).json({ message: "No Appointments Found" });
//     }

//     const appointmentDetails = await Promise.all(
//       appointments.map(async (appointment) => {
//         const user = await User.findOne({ _id: appointment.user_id });

//         return {
//           appointment,
//           user: user || null,
//         };
//       })
//     );

//     res.status(200).json({ appointmentDetails });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// //Incomplete Appointment Function
// const acceptOrDeclineAppointment = async (req, res) => {
//   const { hospital_id, appointment_id, status, date } = req.body;
//   if (!hospital_id) {
//     return res.status(400).json({ message: "Error in selecting the hospital" });
//   }
//   if (!appointment_id) {
//     return res.status(404).json({ message: "No Appointment" });
//   }
//   if (!status) {
//     return res.status(400).json({ message: "Select Accept or Decline" });
//   }
//   if (!date) {
//     return res.status(400).json({ message: "Select A Date" });
//   }

//   try {
//     const hospital = await Hospital.findById(hospital_id);
//     if (!hospital) {
//       return res.status(404).json({ message: "Hospital Not Found" });
//     }
//     const appointment = await Appointment.findOne({
//       _id: appointment_id,
//       status: "Pending",
//     });
//     if (!appointment) {
//       return res.status(404).json({ message: "No Appointments" });
//     }
//     switch (status) {
//       case "Accept":
//         await Appointment.findByIdAndUpdate(appointment_id, {
//           status: "Accepted",
//           date,
//         });
//         appointment.status = "Accepted";

//         break;
//       case "Decline":
//         await Appointment.findByIdAndUpdate(appointment_id, {
//           status: "Declined",
//         });
//         appointment.status = "Declined";
//         break;
//       default:
//         return res.status(400).json({ message: "Invalid Status" });
//     }
//     return res.status(200).json(appointment);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

module.exports = {
  getInsurance,
  createHospital,
  loginHospital,
  acceptOrDeclineRequest,
  getAllRequests,
};
