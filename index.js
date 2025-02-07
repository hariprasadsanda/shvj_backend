const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const ownerRoutes = require('./routes/ownerRoutes');
const vehicleRoutes = require('./routes/vechileRoutes');  // Fixed typo 'vechile' to 'vehicle'
const tripRoutes = require('./routes/tripRoutes');

dotenv.config();

const PORT = process.env.PORT || 9000;  // Corrected port assignment

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

const app = express();

// Middleware setup
app.use(cors());  // CORS middleware for cross-origin requests
app.use(express.json());  // Middleware for parsing JSON bodies

// Routes setup
app.use('/owner', ownerRoutes);
app.use('/vehicle', vehicleRoutes);  // Fixed typo 'vechile' to 'vehicle'
app.use('/trip',tripRoutes) 
app.use('/', (req, res) => {
  res.send('Welcome to the Truck Management API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
