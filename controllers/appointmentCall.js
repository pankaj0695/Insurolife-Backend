require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");

async function getAccessToken(code) {
  try {
    const response = await axios.post("https://zoom.us/oauth/token", null, {
      params: {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.ZOOM_REDIRECT_URI,
      },
      auth: {
        username: process.env.ZOOM_CLIENT_ID,
        password: process.env.ZOOM_CLIENT_SECRET,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error Response:", error.response.data); // Error from the Zoom API
    } else if (error.request) {
      console.error("No Response Received:", error.request); // No response received from the server
    } else {
      console.error("Error Setting Up Request:", error.message); // Error in setting up the request
    }
  }
}

// Utility function to generate a Zoom link
async function generateZoomLink(accessToken, date) {
  const meetingDetails = {
    topic: "Counseling session with SAMPLE",
    type: 2, // Scheduled meeting
    start_time: date.toISOString(), // Meeting start time in ISO format with timezone
    duration: 60, // Duration in minutes
    timezone: "UTC", // You can change this to your preferred timezone
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: true,
    },
  };

  try {
    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingDetails,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.join_url;
  } catch (error) {
    console.error("Error creating Zoom meeting:", error.message);
  }
}

// const returnMeeting = async (req, res) => {
//   const code = req.query.code;
//   const meetingDate = new Date("2024-09-20T10:00:00Z");

//   try {
//     const tokenData = await getAccessToken(code);
//     const accessToken = tokenData.access_token;

//     const zoomLink = await generateZoomLink(accessToken, meetingDate);
//     res.status(200).json({ appointmentLink: zoomLink });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

module.exports = { getAccessToken, generateZoomLink };
