const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    gender: String,
    email: String,
    student_id: String,
    phone: String,
    dob: Date,
    address: String,
    guardian: {
        guardian_name: String,
        guardian_relation: String,
        guardian_phone: String
    },
    academic: {
        course: String,
        course_id: String,
        semester: Number,
        admission_date: Date
    },
    fee_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fee" }] // Linking fees
}, { timestamps: true });

module.exports = mongoose.model("Student", StudentSchema);