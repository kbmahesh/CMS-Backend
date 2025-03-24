const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },
    duration: { type: Number, required: true },
    department: { type: String, required: true },
    courseType: { type: String, enum: ["B.Tech", "M.Tech"], required: true }
});

const Course = mongoose.model("Course", CourseSchema);
module.exports = Course;