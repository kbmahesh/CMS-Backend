const mongoose = require("mongoose");

const FeeTypeSchema = new mongoose.Schema({
    fee_type_id: { type: String, required: true, unique: true },  // Unique Fee Type ID
    fee_name: { type: String, required: true },                   // Fee Name (e.g., Tuition Fee)
    description: { type: String },                                // Optional Description
    created_at: { type: Date, default: Date.now }                // Timestamp
});

module.exports = mongoose.model("FeeType", FeeTypeSchema);
