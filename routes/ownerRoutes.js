const ownerController = require('../controllers/ownerController');
const express = require('express');
const verifyToken = require('../Middleware/verifyToken'); // Middleware for token verification

const router = express.Router();

// Owner Registration Route
router.post('/register', ownerController.ownerRegister);

// Owner Login Route
router.post('/login', ownerController.ownerLogin);

// Owner Deletion Route
router.delete("/delete", verifyToken, ownerController.deleteOwner);

module.exports = router;
