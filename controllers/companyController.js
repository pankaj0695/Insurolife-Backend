const Company = require("../models/companyModel");
const Hospital = require("../models/hospitalModel");
const Request = require("../models/insuranceRequestModel");
const Insurance = require("../models/insuranceModel");
const mongoose = require("mongoose");

const sendRequest = async (req, res) => {
  const { hospital_name, company_name, insurance_name } = req.body;
  let emptyFields = [];
  if (!hospital_name) {
    emptyFields.push("Hospital");
  }
  if (!company_name) {
    emptyFields.push("Company");
  }
  if (!insurance_name) {
    emptyFields.push("Insurance");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ message: "Please Enter In All The Fields", emptyFields });
  }
  try {
    //Getting ids of entities and checking if they exist
    const hospital = await Hospital.findOne({ hospital_name }, { id: 1 });
    const company = await Company.findOne({ company_name }, { id: 1 });
    const insurance = await Insurance.findOne({ insurance_name }, { id: 1 });
    if (!hospital) {
      return res.status(404).json({ message: "Hospital Doesn't Exist" });
    }
    if (!company) {
      return res.status(404).json({ message: "Company Doesn't Exist" });
    }
    if (!insurance) {
      return res.status(404).json({ message: "Insurance Doesn't exist" });
    }

    const hospital_id = hospital._id;
    const company_id = company._id;
    const insurance_id = insurance._id;

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
  const { company_name } = req.body;
  if (!company_name) {
    return res.status(400).json({ message: "Please Enter In All The Fields" });
  }
  try {
    const existingName = await Company.findOne({ company_name });
    if (existingName) {
      return res
        .status(400)
        .json({ message: "Company with this name already exists" });
    }
    const company = await Company.create({ company_name });
    res.status(200).json({ company });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createInsurance = async (req, res) => {
  const { insurance_name, claim, compatibility, emi } = req.body;
  const emptyFields = [];
  if (!insurance_name) {
    emptyFields.push("Insurance Name");
  }
  if (!claim) {
    emptyFields.push("Claim");
  }
  if (!compatibility) {
    emptyFields.push("Compatibility");
  }
  if (!emi) {
    emptyFields.push("EMI");
  }
  if (emptyFields.length > 0) {
    return res.status(400).json({ message: "Please Enter In All The Fields" });
  }
  try {
    const existingInsuranceName = await Insurance.findOne({ insurance_name });
    if (existingInsuranceName) {
      return res.status(400).json({ message: "Insurance Already Exists" });
    }
    const insurance = await Insurance.create({
      insurance_name,
      claim,
      compatibility,
      emi,
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

module.exports = {
  sendRequest,
  createCompany,
  createInsurance,
  pendingRequest,
  acceptedRequest,
  declinedRequest,
};
