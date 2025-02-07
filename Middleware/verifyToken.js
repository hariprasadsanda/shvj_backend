const Owner = require("../models/Owner");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const secretKey = process.env.WhatIsYourName;

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("❌ Token missing or invalid format");
            return res.status(401).json({ error: "Token is required" });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, secretKey);
        

        // Ensure the token contains an ownerId (Fix the issue)
        if (!decoded.ownerId) {
            console.log("❌ Decoded token does not have an 'ownerId'");
            return res.status(401).json({ error: "Invalid token format" });
        }

        // Find owner in database using `ownerId` instead of `id`
        const owner = await Owner.findById(decoded.ownerId);
        if (!owner) {
            console.log("❌ Owner not found for ID:", decoded.ownerId);
            return res.status(404).json({ error: "Owner not found in verifyToken" });
        }

        req.owner = owner; // Attach owner to request
        next();
    } catch (error) {
        console.error("❌ Token verification error:", error);
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = verifyToken;
