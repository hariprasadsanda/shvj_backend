const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    startLocation: { type: String, required: true },  // Added start location
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    loadInTons: { type: Number, required: true },  // Load weight in tons
    costPerTon: { type: Number, required: true },  // Rate per ton
    income: { type: Number, default: 0 },  // Total earnings (calculated field)
    expenses: {
        fuel: { type: Number, default: 0 },
        tolls: { type: Number, default: 0 },
        maintenance: { type: Number, default: 0 },
        driverPayment: { type: Number, default: 0 },
        loadingExpenses: { type: Number, default: 0 },  // Extra loading costs
        unloadingExpenses: { type: Number, default: 0 },  // Extra unloading costs
        other: { type: Number, default: 0 }
    },
    totalProfit: { type: Number, default: 0 }  // Net earnings after expenses
});

// Pre-save middleware to calculate income & profit
tripSchema.pre('save', function (next) {
    this.income = this.loadInTons * this.costPerTon;  // Calculate total income
    const totalExpenses = Object.values(this.expenses).reduce((acc, val) => acc + val, 0);
    this.totalProfit = this.income - totalExpenses;  // Calculate profit
    next();
});

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;
