const Trip = require('../models/Trip');
const Vehicle = require('../models/Vechile');
const Owner = require('../models/Owner');

// 🛠 Add a new trip
const addTrip = async (req, res) => {
    try {
        const { 
            vehicleNumber, 
            startLocation, 
            destination, 
            startDate, 
            endDate, 
            loadInTons, 
            costPerTon, 
            expenses 
        } = req.body;

        // Get authenticated owner's ID from token
        const ownerId = req.owner._id;

        // Find the vehicle based on vehicleNumber and ensure it belongs to the logged-in owner
        const vehicle = await Vehicle.findOne({ vehicleNumber, owner: ownerId });

        if (!vehicle) {
            return res.status(403).json({ error: "Vehicle is not authorized by this owner. Please log in with the correct owner account." });
        }

        // Calculate income: total amount earned from the trip
        const income = loadInTons * costPerTon;

        // Calculate total expenses
        const totalExpenses = Object.values(expenses).reduce((acc, val) => acc + val, 0);

        // Calculate total profit
        const totalProfit = income - totalExpenses;

        // Create a new trip
        const newTrip = new Trip({
            vehicle: vehicle._id,
            vehicleNumber,
            driver: ownerId,
            startLocation,
            destination,
            startDate,
            endDate,
            loadInTons,
            costPerTon,
            income,
            expenses,
            totalProfit
        });

        // Save trip to DB
        await newTrip.save();

        res.status(201).json({ message: "Trip added successfully!", trip: newTrip });

    } catch (error) {
        console.error("Error adding trip:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🛠 Get all trips of an owner
const getOwnerTrips = async (req, res) => {
    try {
        const ownerId = req.owner._id;

        // Find all trips where the owner is the driver
        const trips = await Trip.find({ driver: ownerId }).populate("vehicle");

        res.status(200).json({ trips });

    } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🛠 Get trips of a specific vehicle
const getVehicleTrips = async (req, res) => {
    try {
        const ownerId = req.owner._id;
        const { vehicleNumber } = req.params;

        // Validate if the vehicle belongs to the owner
        const vehicle = await Vehicle.findOne({ vehicleNumber, owner: ownerId });

        if (!vehicle) {
            return res.status(403).json({ error: "Unauthorized access to vehicle trips!" });
        }

        // Get trips of the specific vehicle
        const trips = await Trip.find({ vehicle: vehicle._id });

        res.status(200).json({ vehicleNumber, trips });

    } catch (error) {
        console.error("Error fetching vehicle trips:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🛠 Delete a trip
const deleteTrip = async (req, res) => {
    try {
        const ownerId = req.owner._id;
        const { tripId } = req.params;

        // Find the trip and check if it belongs to the owner
        const trip = await Trip.findOne({ _id: tripId, driver: ownerId });

        if (!trip) {
            return res.status(404).json({ error: "Trip not found or unauthorized access!" });
        }

        await Trip.findByIdAndDelete(tripId);

        res.status(200).json({ message: "Trip deleted successfully!" });

    } catch (error) {
        console.error("Error deleting trip:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getOwnerFinancialSummary = async (req, res) => {
    try {
        const ownerId = req.owner._id;
        const { year, month } = req.query;

        let matchStage = { driver: ownerId };
        if (year) matchStage.startDate = { $gte: new Date(`${year}-01-01`), $lt: new Date(`${parseInt(year) + 1}-01-01`) };
        if (month) matchStage.startDate = { $gte: new Date(`${year}-${month}-01`), $lt: new Date(`${year}-${parseInt(month) + 1}-01`) };

        const summary = await Trip.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalIncome: { $sum: "$income" },
                    totalExpenses: { $sum: { 
                        $add: ["$expenses.fuel", "$expenses.tolls", "$expenses.maintenance", "$expenses.driverPayment", "$expenses.other"]
                    } },
                    totalProfit: { $sum: "$totalProfit" },
                    totalTrips: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({ year, month, summary: summary[0] || {} });
    } catch (error) {
        console.error("Error fetching owner financial summary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🛠 Get financial summary for a vehicle (monthly & yearly)
const getVehicleFinancialSummary = async (req, res) => {
    try {
        const ownerId = req.owner._id;
        const { vehicleNumber, year, month } = req.query;

        const vehicle = await Vehicle.findOne({ vehicleNumber, owner: ownerId });
        if (!vehicle) {
            return res.status(403).json({ error: "Unauthorized access to vehicle data!" });
        }

        let matchStage = { vehicle: vehicle._id };
        if (year) matchStage.startDate = { $gte: new Date(`${year}-01-01`), $lt: new Date(`${parseInt(year) + 1}-01-01`) };
        if (month) matchStage.startDate = { $gte: new Date(`${year}-${month}-01`), $lt: new Date(`${year}-${parseInt(month) + 1}-01`) };

        const summary = await Trip.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalIncome: { $sum: "$income" },
                    totalExpenses: { $sum: { 
                        $add: ["$expenses.fuel", "$expenses.tolls", "$expenses.maintenance", "$expenses.driverPayment", "$expenses.other"]
                    } },
                    totalProfit: { $sum: "$totalProfit" },
                    totalTrips: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({ vehicleNumber, year, month, summary: summary[0] || {} });
    } catch (error) {
        console.error("Error fetching vehicle financial summary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🛠 Get number of trips per month & year for the owner (all vehicles)
const getOwnerTripCounts = async (req, res) => {
    try {
        const ownerId = req.owner._id;
        const { year } = req.query;

        let matchStage = { driver: ownerId };
        if (year) matchStage.startDate = { $gte: new Date(`${year}-01-01`), $lt: new Date(`${parseInt(year) + 1}-01-01`) };

        const tripCounts = await Trip.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { month: { $month: "$startDate" }, year: { $year: "$startDate" } },
                    totalTrips: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.status(200).json({ tripCounts });
    } catch (error) {
        console.error("Error fetching owner trip counts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🛠 Get number of trips per month & year for a specific vehicle
const getVehicleTripCounts = async (req, res) => {
    try {
        const ownerId = req.owner._id;
        const { vehicleNumber, year } = req.query;

        const vehicle = await Vehicle.findOne({ vehicleNumber, owner: ownerId });
        if (!vehicle) {
            return res.status(403).json({ error: "Unauthorized access to vehicle trips!" });
        }

        let matchStage = { vehicle: vehicle._id };
        if (year) matchStage.startDate = { $gte: new Date(`${year}-01-01`), $lt: new Date(`${parseInt(year) + 1}-01-01`) };

        const tripCounts = await Trip.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { month: { $month: "$startDate" }, year: { $year: "$startDate" } },
                    totalTrips: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.status(200).json({ vehicleNumber, tripCounts });
    } catch (error) {
        console.error("Error fetching vehicle trip counts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
module.exports = { addTrip, getOwnerTrips, getVehicleTrips, deleteTrip , getOwnerFinancialSummary, 
    getVehicleFinancialSummary, 
    getOwnerTripCounts, 
    getVehicleTripCounts };
