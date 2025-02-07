const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    ownerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    vehicles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle', // Reference to the Vehicle model
    }]
});

const Owner = mongoose.model('Owner', ownerSchema);

module.exports = Owner;
