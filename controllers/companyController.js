const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Company = require("../models/companyModel");
const Hospital = require("../models/hospitalModel");
const Request = require("../models/insuranceRequestModel");
const Insurance = require("../models/insuranceModel");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const Counsellor = require("../models/counsellorModel");

const { SECRET_KEY } = require("../helpers/helper");

const sendRequest = async (req, res) => {
  const { hospital_id, insurance_id } = req.body;
  let emptyFields = [];
  if (!hospital_id) {
    emptyFields.push("Hospital");
  }
  if (!insurance_id) {
    emptyFields.push("Insurance");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ message: "Please Enter In All The Fields", emptyFields });
  }
  try {
    //Getting ids of entities and checking if they exist
    const hospital = await Hospital.findById(hospital_id);
    const insurance = await Insurance.findById(insurance_id);
    const company_id = insurance.company_id;
    const company = await Company.findById(company_id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital Doesn't Exist" });
    }
    if (!company) {
      return res.status(404).json({ message: "Company Doesn't Exist" });
    }
    if (!insurance) {
      return res.status(404).json({ message: "Insurance Doesn't exist" });
    }

    //checking if the request already exists or not
    const id = await Request.find(
      { hospital_id, company_id, insurance_id },
      { _id: 1 }
    );

    if (id.length !== 0) {
      return res.status(400).json({ message: "Request Already Sent" });
    }
    const status = "Pending";
    const request = await Request.create({
      hospital_id,
      company_id,
      insurance_id,
      status,
    });

    const { requests } = await Hospital.findById(hospital_id, {
      requests: 1,
      _id: 0,
    });
    requests.push(request._id);
    await Hospital.findByIdAndUpdate(hospital_id, {
      requests: requests,
    });
    res.status(200).json({ request });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//creating a company profile
const createCompany = async (req, res) => {
  const { company_name, image, email, password, city, state, contactNo } =
    req.body;
  if (
    !company_name ||
    !image ||
    !email ||
    !password ||
    !city ||
    !state ||
    !contactNo
  ) {
    return res.status(400).json({ message: "Please Enter In All The Fields" });
  }
  try {
    const existingName = await Company.findOne({ email });
    if (existingName) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const company = await Company.create({
      company_name,
      image,
      email,
      password: hashedPassword,
      city,
      state,
      contactNo,
    });
    const token = jwt.sign({ name: company_name }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ company, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginCompany = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please Enter In All The Fields" });
  }
  try {
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(403).json({ message: "Email is Invalid" });
    }

    const validPassword = await bcrypt.compare(password, company.password);
    if (!validPassword) {
      return res.status(403).send("Invalid password");
    }
    const token = jwt.sign({ name: company.company_name }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ company, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createInsurance = async (req, res) => {
  const {
    company_id,
    insurance_name,
    insurer,
    logo,
    claim,
    premium,
    tags,
    description,
  } = req.body;
  const emptyFields = [];
  if (!company_id) {
    emptyFields.push("Company ID");
  }
  if (!insurance_name) {
    emptyFields.push("Insurance Name");
  }
  if (!insurer) {
    emptyFields.push("Insurer Name");
  }
  if (!logo) {
    emptyFields.push("Insurer Logo");
  }
  if (!claim) {
    emptyFields.push("Claim");
  }
  if (!premium) {
    emptyFields.push("Premium");
  }
  if (!tags) {
    emptyFields.push("Tags");
  }
  if (!description) {
    emptyFields.push("Description");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ message: "Please Enter In All The Fields", emptyFields });
  }
  try {
    const existingInsuranceName = await Insurance.findOne({ insurance_name });
    if (existingInsuranceName) {
      return res.status(400).json({ message: "Insurance Already Exists" });
    }
    const insurance = await Insurance.create({
      insurance_name,
      insurer,
      logo,
      claim,
      premium,
      tags,
      description,
    });
    const insurance_id = insurance._id;
    const hospital_ids = await Hospital.find();
    if (hospital_ids.length === 0) {
      return res.status(404).json({ message: "No Hospitals" });
    }
    hospital_ids.map(async (hospital_id) => {
      await Request.create({
        hospital_id,
        company_id,
        insurance_id,
        status: "Pending",
      });
    });
    res.status(200).json({ insurance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const pendingRequest = async (req, res) => {
  const { company_id } = req.body;
  if (!company_id) {
    return res.status(400).json({ message: "Please Provide The Company ID" });
  }
  try {
    const requests = await Request.find({ company_id, status: "Pending" });
    if (requests.length === 0) {
      const company = await Company.findOne({ _id: company_id });
      if (!company) {
        return res.status(400).json({ message: "Company Doesn't Exist" });
      }
      return res.status(200).json({ message: "No Pending Requests" });
    }
    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const acceptedRequest = async (req, res) => {
  const { company_id } = req.body;
  if (!company_id) {
    return res.status(400).json({ message: "Please Provide The Company ID" });
  }
  try {
    const requests = await Request.find({ company_id, status: "Accepted" });
    if (requests.length === 0) {
      const company = await Company.findOne({ _id: company_id });
      if (!company) {
        return res.status(400).json({ message: "Company Doesn't Exist" });
      }
      return res.status(200).json({ message: "No Accepted Requests" });
    }
    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const allInsurances = async (req, res) => {
  const { company_id } = req.body;
  if (!company_id) {
    return res.status(400).json({ message: "Please Provide The Company ID" });
  }
  try {
    const insurances = await Insurance.find({ company_id });
    if (insurances.length === 0) {
      return res.status(404).json({ message: "No Insurance Registered" });
    }
    res.status(200).json(insurances);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const declinedRequest = async (req, res) => {
  const { company_id } = req.body;
  if (!company_id) {
    return res.status(400).json({ message: "Please Provide The Company ID" });
  }
  try {
    const requests = await Request.find({ company_id, status: "Declined" });
    if (requests.length === 0) {
      const company = await Company.findOne({ _id: company_id });
      if (!company) {
        return res.status(400).json({ message: "Company Doesn't Exist" });
      }
      return res.status(200).json({ message: "No Declined Requests" });
    }
    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateDiscount = async (req, res) => {
  const { insurance_id, discount } = req.body;
  const emptyFields = [];
  if (!insurance_id) {
    emptyFields.push("Insurance ID");
  }
  if (!discount) {
    emptyFields.push("Discount");
  }
  if (emptyFields.length !== 0) {
    return res
      .status(400)
      .json({ message: "Please Fill in all the Fields", emptyFields });
  }
  try {
    const insurance = await Insurance.applyDiscount(insurance_id, discount);
    res.status(200).json(insurance);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getAllAppointments = async (req, res) => {
  const { company_id } = req.body;
  if (!company_id) {
    return res.status(400).json({ message: "Please provide Company ID" });
  }

  try {
    const appointments = await Appointment.find({ company_id });

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

//Not Tested Properly, might Glitch
const scheduleAppointment = async (req, res) => {
  const { company_id, appointment_id, status, date, zoomLink } = req.body;
  if (!company_id) {
    return res.status(400).json({ message: "Error in selecting the company" });
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
  if (!zoomLink) {
    return res.status(400).json({ message: "Provide Meeting Link" });
  }
  try {
    const company = await Company.findById(company_id);
    if (!company) {
      return res.status(404).json({ message: "company Not Found" });
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
        //Meeting link to be sent in Appointment.meeting here
        await Appointment.findByIdAndUpdate(appointment_id, {
          status: "Declined",
          meeting: zoomLink,
        });
        appointment.status = "Declined";
        appointment.meeting = zoomLink;
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

const markAsDone = async (req, res) => {
  const { appointment_id } = req.body;
  const appointment = await Appointment.findById(appointment_id);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment Not Found" });
  }
  if (appointment.status === "Accepted") {
    appointment.status = "Completed";
    try {
      await appointment.save();
      res.status(200).json(appointment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(400).json({ message: "Some Error Occured" });
  }
};

const newCounsellor = async (req, res) => {
  const {
    name,
    insurer,
    company_id,
    company_logo,
    tags,
    phone_no,
    email,
    image,
  } = req.body;
  const emptyFields = [];
  if (!name) {
    emptyFields.push("Name");
  }
  if (!insurer) {
    emptyFields.push("Insurer");
  }
  if (!image) {
    emptyFields.push("Image");
  }
  if (!company_logo) {
    emptyFields.push("Company Logo");
  }
  if (!company_id) {
    emptyFields.push("Company ID");
  }
  if (!phone_no) {
    emptyFields.push("Phone No");
  }
  if (!email) {
    emptyFields.push("Email");
  }

  if (emptyFields.length !== 0) {
    return res
      .status(400)
      .json({ message: "Please Enter in all the Fields", emptyFields });
  }
  try {
    const existingCounsellor = await Counsellor.findOne({ email });
    if (existingCounsellor) {
      return res
        .status(400)
        .json({ message: "This email is already Registered" });
    }
    const company = await Company.findById(company_id);
    if (!company) {
      return res.status(404).json({ message: "Company Not Found" });
    }
    const counsellor = await Counsellor.create({
      name,
      insurer,
      image,
      company_id,
      company_logo,
      tags,
      phone_no,
      email,
    });
    if (!counsellor) {
      return res.status(500).json({ message: "Some Error Occured" });
    }
    res.status(200).json({ counsellor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllCounsellor = async (req, res) => {
  const { company_id } = req.body;
  if (!company_id) {
    return res.status(404).json({ message: "Company Required" });
  }
  const counsellor = await Counsellor.find({ company_id });
  if (counsellor.length === 0) {
    return res.status(404).json({ message: "No counsellors" });
  }
  const insurer = await Company.findById(company_id);
  const insurer_name = insurer.company_name;
  res.status(200).json({ ...counsellor, insurer: insurer_name });
};

module.exports = {
  sendRequest,
  createCompany,
  loginCompany,
  createInsurance,
  pendingRequest,
  acceptedRequest,
  declinedRequest,
  updateDiscount,
  getAllAppointments,
  scheduleAppointment,
  markAsDone,
  newCounsellor,
  getAllCounsellor,
  allInsurances,
};
