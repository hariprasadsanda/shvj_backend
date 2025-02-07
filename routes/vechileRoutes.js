const vehicleController = require('../controllers/vechileController');
const express = require('express');
const verifyToken = require('../Middleware/verifyToken'); // Middleware for token verification

const router = express.Router();

// Vehicle Registration Route
router.post('/Add-vehicle', verifyToken, vehicleController.vehicleRegister);
router.get("/owner/:ownerId", vehicleController.getVehiclesByOwner);
router.delete('/delete/:vehicleId', verifyToken, vehicleController.deleteVehicle);

module.exports = router;
