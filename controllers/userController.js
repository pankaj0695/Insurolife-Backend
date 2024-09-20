const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const Hospital = require("../models/hospitalModel");
const Company = require("../models/companyModel");
const Appointment = require("../models/appointmentModel");
const Insurance = require("../models/insuranceModel");
const Rating = require("../models/ratingModel");

const { SECRET_KEY } = require("../helpers/helper");

//This is a comment
const createUser = async (req, res) => {
  const { name, image, gender, dob, email, contactNo, city, state, password } =
    req.body;
  const emptyFields = [];
  if (!name) {
    emptyFields.push("Name");
  }
  if (!gender) {
    emptyFields.push("Gender");
  }
  if (!image) {
    emptyFields.push("Image");
  }
  if (!dob) {
    emptyFields.push("DOB");
  }
  if (!email) {
    emptyFields.push("Email");
  }
  if (!contactNo) {
    emptyFields.push("Contact No");
  }
  if (!city) {
    emptyFields.push("City");
  }
  if (!state) {
    emptyFields.push("State");
  }
  if (!password) {
    emptyFields.push("Password");
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      image,
      gender,
      dob,
      email,
      contactNo,
      city,
      state,
      password: hashedPassword,
    });

    const token = jwt.sign({ name: name }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please Enter In All The Fields" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "Email is Invalid" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(403).send("Invalid password");
    }
    const token = jwt.sign({ name: user.name }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addMedicalRecord = async (req, res) => {
  const { user_id, date, image, description } = req.body;
  if (!image) {
    return res.status(400).json({ message: "Enter A Image File" });
  }
  if (!date) {
    return res.status(400).json({ message: "Enter Date" });
  }
  if (!description) {
    return res.status(400).json({ message: "Enter A Description" });
  }
  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "Invalid User ID" });
    }
    user.medical_records.push({ date, image, description });
    res.status(200).json({ user_id, date, image, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMedicalRecord = async (req, res) => {
  const { user_id, image } = req.body;
  if (!image) {
    return res.status(400).json({ message: "Choose A File" });
  }
  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "Invalid User ID" });
    }

    const indexOfRecord = user.medical_records.findIndex(
      (record) => record.image == image
    );

    if (indexOfRecord === -1) {
      return res.status(404).json({ message: "Record Not Found" });
    }
    user.medical_records.splice(indexOfRecord, 1);
    await user.save();
    return res
      .status(200)
      .json({ message: "Medical record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNearbyHospital = async (req, res) => {
  const { city, state } = req.body;
  try {
    if (!city && !state) {
      const nearbyHospitals = await Hospital.find();
      if (nearbyHospitals.length === 0) {
        return res
          .status(200)
          .json({ message: "No Registered Hospitals in your area" });
      }
      res.status(200).json(nearbyHospitals);
    }
    if (!city) {
      const nearbyHospitals = await Hospital.find({ state });
      if (nearbyHospitals.length === 0) {
        return res
          .status(200)
          .json({ message: "No Registered Hospitals in your area" });
      }
      res.status(200).json(nearbyHospitals);
    }
    const nearbyHospitals = await Hospital.find({ city, state });
    if (nearbyHospitals.length === 0) {
      return res
        .status(200)
        .json({ message: "No Registered Hospitals in your area" });
    }
    res.status(200).json(nearbyHospitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//For dropdown of companies
const getAllCompanies = async (req, res) => {
  try {
    const company = await Company.find();
    if (company.length === 0) {
      return res.status(404).json({ message: "No Insurance Companies" });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//With Filters
const getAllInsurance = async (req, res) => {
  const { filter, value } = req.body;
  try {
    //Company, Price, Claim
    switch (filter) {
      case "company":
        const insurance1 = await Insurance.find({ company_id: value });
        if (insurance1.length === 0) {
          return res
            .status(404)
            .json({ message: "No Insurance By this Company" });
        }
        res.status(200).json(insurance1);
        break;
      case "price":
        const insurance2 = await Insurance.find({ emi: { $lt: value } });
        if (insurance2.length === 0) {
          return res
            .status(404)
            .json({ message: "No Insurance in this Range" });
        }
        res.status(200).json(insurance2);
        break;
      case "claim":
        const insurance3 = await Insurance.find({ claim: { $lt: value } });
        if (insurance3.length === 0) {
          return res
            .status(404)
            .json({ message: "No Insurance in this Range" });
        }
        res.status(200).json(insurance3);
        break;
      default:
        const insurance = await Insurance.find();
        if (insurance.length === 0) {
          return res.status(404).json({ message: "No Insurance Found" });
        }
        res.status(200).json(insurance);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Completed Appointment function
const bookAppointment = async (req, res) => {
  //These ID's are mongodb object
  const { user_id, company_id, timing } = req.body;
  const emptyFields = [];
  if (!user_id) {
    emptyFields.push("User ID");
  }
  const appointment = await Appointment.findOne({
    user_id,
    status: { $in: ["Accepted", "Pending"] },
  });
  if (appointment) {
    return res
      .status(400)
      .json({ message: "An Appointment is already booked" });
  }
  if (!company_id) {
    emptyFields.push("Company ID");
  }
  if (!timing) {
    emptyFields.push("Timing");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ message: "Please Enter in all the Fields", emptyFields });
  }
  const company = await Company.findById(company_id);
  if (!company) {
    return res.status(400).json({ message: "company Doesn't Exist" });
  }
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(400).json({ message: "User Doesn't Exist" });
  }
  const status = "Pending";
  const newAppointment = await Appointment.create({
    user_id,
    company_id,
    timing,
    status,
  });

  if (!newAppointment) {
    return res.status(500).json({ message: "Some Error Occured" });
  }
  res.status(200).json(newAppointment);
};

const giveRatings = async (req, res) => {
  const { user_id, hospital_id, rating } = req.body;
  const emptyFields = [];
  if (!user_id) {
    emptyFields.push("User ID");
  }
  if (!hospital_id) {
    emptyFields.push("Hospital ID");
  }
  if (!rating) {
    emptyFields.push("Rating");
  }
  if (emptyFields.length !== 0) {
    return res
      .status(400)
      .json({ message: "Please Enter in all the Fields", emptyFields });
  }

  const existingUser = await User.findById(user_id);
  if (!existingUser) {
    return res.status(400).json({ message: "Invalid User Id" });
  }
  const existingRating = await Rating.findOne({ user_id, hospital_id });
  if (existingRating) {
    return res
      .status(400)
      .json({ message: "You can't Rate Twice or Change the Rating" });
  }
  try {
    const userRate = await Rating.create({ user_id, hospital_id, rating });
    const hospital = await Hospital.findOne({ _id: hospital_id });
    if (!userRate) {
      return res.status(500).json({ message: "Some Error Occured" });
    }
    if (!hospital) {
      return res.status(500).json({ message: "Some Error Occured" });
    }

    const totalRatings = hospital.avgRating * hospital.ratingCount;
    hospital.ratingCount++;
    hospital.avgRating = (totalRatings + Number(rating)) / hospital.ratingCount;
    hospital.save();
    return res.status(200).json({ message: "Thank-you For Rating" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getInsurance = async (req, res) => {
  const { insurance_id } = req.body;
  if (!insurance_id) {
    return res.status(400).json({ message: "Please Provide Insurance ID" });
  }
  try {
    const insurance = await Insurance.findById(_id);
    if (!insurance) {
      return res.status(404).json({ message: "Insurance Not Found" });
    }
    res.status(200).json(insurance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  getNearbyHospital,
  bookAppointment,
  giveRatings,
  getAllInsurance,
  getAllCompanies,
  addMedicalRecord,
  deleteMedicalRecord,
  getInsurance,
};
