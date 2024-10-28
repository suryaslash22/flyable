// server.js
require('dotenv').config(); // Load environment variables

const express = require('express');
const Amadeus = require('amadeus');
const cors = require('cors');
const { data } = require('jquery');
// const axios = require('axios'); // Import axios for making API requests

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Amadeus with credentials from .env file
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

app.get('/', (req, res) => {
  res.send('API is running');
});

// Define your flight offers API route
app.get('/flight-offers', async (req, res) => {
  const { originLocationCode, destinationLocationCode, departureDate, adults } = req.query;

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching flight offers:', error);
    // Return a more detailed error response
    res.status(error.statusCode || 500).json({
      error: error.message,
      details: error.response?.data || 'An error occurred while fetching flight offers',
    });
  }
});

// Define your airport suggestions API route
app.get('/airports', async (req, res) => {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: "Please provide a keyword." });
    }

    else if (keyword.length < 3) {
      return res.status(400).json({ error: "Please provide more characters (minimum 3)." });
    }

  try {
    const response = await amadeus.referenceData.locations.cities.get({
      keyword
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching airport suggestions:', error);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || 'An error occurred while fetching airport suggestions',
    });
  }
});

// Define your airport suggestions API route
app.get('/a-and-c', async (req, res) => {
    try {
        // Retrieve information about the LHR airport?
        const response = await amadeus.referenceData.location("AONT").get();
        res.json(response.data);
  } catch (error) {
    console.error('Error fetching airport suggestions:', error);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || 'An error occurred while fetching airport suggestions',
    });
  }
});

// Seat map retrieval
app.post('/seatmap', async (req, res) => {
    try {
        // Returns all the seat maps of a given flightOffer
        // const flightOffersResponse = await amadeus.shopping.flightOffersSearch.get({
        // originLocationCode: "MAA",
        // destinationLocationCode: "DXB",
        // departureDate: "2024-11-11",
        // adults: "1",
        // });

        // const flightOffer = flightOffersResponse.data[0];
        // console.log(req.body)
        const flightOffer = req.body.flight; // Extract flightOffer from the request body
        // console.log('Sending flight data:', flightOffer);

        if (!flightOffer) {
            return res.status(400).json({ error: "Flight data is missing." });
        }

        const response = await amadeus.shopping.seatmaps.post(
        JSON.stringify({
            data: [flightOffer]  // Make sure to stringify the data
        })
        );

        res.json(response.data);
        // console.log(response.data);
    } catch (error) {
      console.error('Error fetching seatmap:', error);
      res.status(error.response?.status || 500).json({
          error: error.message,
          details: error.response?.data || 'An error occurred while fetching seatmap',
      });
  }
});

// Retrieve airline info from code
app.get('/airline-code', async (req, res) => {
  const { airlineCodes } = req.query;
  try {
    const response = await amadeus.referenceData.airlines.get({
      airlineCodes
    });
    res.json(response.data);
    // console.log(response);
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
