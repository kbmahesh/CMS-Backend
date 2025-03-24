const mongoose = require("mongoose");

const FeeSchema = new mongoose.Schema({
    // student_id: { type: mongoose.Schema.Types.student_id, ref: "Student", required: true },
    student_id: { type: String, required: true },
    academic_year: { type: String, required: true },
    fee_type: { type: String, required: true },
    total_fees: { type: Number, required: true },
    paid_amount: { type: Number, default: 0 },
    due_amount: { type: Number, required: true },
    payment_date: { type: Date, default: null },
    next_due_date: { type: Date, required: true },
    payment_status: { type: String, default: "Pending" },
    payment_mode: { type: String, default: "Not Paid" }
}, { timestamps: true });

module.exports = mongoose.model("Fee", FeeSchema);
