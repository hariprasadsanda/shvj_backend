const express = require("express");
const { addTrip, 
    getOwnerTrips, 
    getVehicleTrips, 
    deleteTrip ,
     getOwnerFinancialSummary,
    getVehicleFinancialSummary,
    getOwnerTripCounts,
    getVehicleTripCounts } = require("../controllers/tripController");
const verifyToken = require("../Middleware/verifyToken");

const router = express.Router();

// Add a new trip (Owner Authentication Required)
router.post("/add", verifyToken, addTrip);

// Get all trips of the logged-in owner
router.get("/owner/trips", verifyToken, getOwnerTrips);

// Get trips of a specific vehicle (Vehicle number as param)
router.get("/vehicle/:vehicleNumber", verifyToken, getVehicleTrips);

// Delete a trip (Only owner can delete their trips)
router.delete("/:tripId", verifyToken, deleteTrip);

router.get('/trips/owner-financial-summary', verifyToken, getOwnerFinancialSummary);
router.get('/trips/vehicle-financial-summary', verifyToken, getVehicleFinancialSummary);
router.get('/trips/owner-trip-counts', verifyToken, getOwnerTripCounts);
router.get('/trips/vehicle-trip-counts', verifyToken, getVehicleTripCounts);

module.exports = router;
