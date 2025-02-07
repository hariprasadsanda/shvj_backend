const Owner = require('../models/Owner');
const Vehicle = require('../models/Vechile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const secretKey = process.env.WhatIsYourName; // Secret key for JWT

// Owner Registration
const ownerRegister = async (req, res) => {
    const { ownerName, email, password } = req.body;
    try {
        const ownerEmail = await Owner.findOne({ email });
        if (ownerEmail) {
            return res.status(400).json({ error: "Email already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newOwner = new Owner({
            ownerName,
            email,
            password: hashedPassword
        });
        await newOwner.save();
        console.log('Registered');
        return res.status(201).json({ message: "Registered successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Owner Login
const ownerLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const owner = await Owner.findOne({ email });
        if (!owner || !(await bcrypt.compare(password, owner.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ ownerId: owner._id }, secretKey, { expiresIn: "1h" });
        const ownerId = owner._id;

        return res.status(200).json({ success: "Login successful", token, ownerId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteOwner = async (req, res) => {
    try {
        const ownerId = req.owner._id; // Get authenticated owner ID from middleware

        // Find the owner
        const owner = await Owner.findById(ownerId);
        if (!owner) {
            return res.status(404).json({ error: "Owner not found" });
        }

        // Delete all vehicles associated with this owner
        await Vehicle.deleteMany({ owner: ownerId });

        // Delete the owner
        await Owner.findByIdAndDelete(ownerId);

        return res.status(200).json({ message: "Owner and associated vehicles deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { ownerRegister, ownerLogin , deleteOwner };
