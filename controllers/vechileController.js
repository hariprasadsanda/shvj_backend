const Vehicle = require('../models/Vechile');
const Owner = require('../models/Owner');

// Vehicle Registration
const vehicleRegister = async (req, res) => {
    const { vehicleNumber, vehicleModel, vehicleCompany, noOfWheels } = req.body;

    try {
        // Ensure the owner is authenticated and associated with the vehicle
        const owner = await Owner.findById(req.owner._id);  // Using req.owner from verifyToken middleware
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        // Check if vehicle number is already registered
        const vehicleNumberCheck = await Vehicle.findOne({ vehicleNumber });
        if (vehicleNumberCheck) {
            return res.status(400).json({ error: "Vehicle Number already taken" });
        }

        // Create a new vehicle
        const newVehicle = new Vehicle({
            vehicleNumber,
            vehicleModel,
            vehicleCompany,
            noOfWheels,
            owner: owner._id
        });

        // Save the vehicle
        const savedVehicle = await newVehicle.save();

        // Add the vehicle to the owner's vehicles list
        owner.vehicles.push(savedVehicle._id);
        await owner.save();

        console.log('Vehicle Registered');
        return res.status(201).json({ message: "Vehicle Registered successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getVehiclesByOwner = async (req, res) => {
    try {
        const ownerId = req.params.ownerId;
        const owner = await Owner.findById(ownerId).populate("vehicles"); // Populating vehicle details

        if (!owner) {
            return res.status(404).json({ error: "Owner not found" });
        }

        res.status(200).json({ ownerName: owner.ownerName, vehicles: owner.vehicles });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

const deleteVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const ownerId = req.owner._id; // Retrieved from verifyToken middleware

        // Find the vehicle
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        // Ensure the vehicle belongs to the logged-in owner
        if (vehicle.owner.toString() !== ownerId.toString()) {
            return res.status(403).json({ error: "Unauthorized to delete this vehicle" });
        }

        // Remove vehicle from owner's vehicles array
        await Owner.findByIdAndUpdate(ownerId, { $pull: { vehicles: vehicleId } });

        // Delete the vehicle
        await Vehicle.findByIdAndDelete(vehicleId);

        return res.status(200).json({ message: "Vehicle deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { vehicleRegister , getVehiclesByOwner , deleteVehicle};
