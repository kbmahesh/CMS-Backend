const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },
    duration: { type: Number, required: true },
    department: { type: String, required: true },
    courseType: { type: String, enum: ["B.Tech", "M.Tech"], required: true }
});

const Course = mongoose.model("Course", CourseSchema);

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/campusSmartCard", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const courses = [
    { courseCode: "CSE-01", courseName: "Computer Science & Engineering", duration: 4, department: "CSE", courseType: "B.Tech" },
    { courseCode: "IT-02", courseName: "Information Technology", duration: 4, department: "IT", courseType: "B.Tech" },
    { courseCode: "ECE-03", courseName: "Electronics & Communication Engineering", duration: 4, department: "ECE", courseType: "B.Tech" },
    { courseCode: "EEE-04", courseName: "Electrical & Electronics Engineering", duration: 4, department: "EEE", courseType: "B.Tech" },
    { courseCode: "ME-05", courseName: "Mechanical Engineering", duration: 4, department: "Mechanical", courseType: "B.Tech" },
    { courseCode: "CE-06", courseName: "Civil Engineering", duration: 4, department: "Civil", courseType: "B.Tech" },
    { courseCode: "AE-07", courseName: "Automobile Engineering", duration: 4, department: "Automobile", courseType: "B.Tech" },
    { courseCode: "PE-08", courseName: "Petroleum Engineering", duration: 4, department: "Petroleum", courseType: "B.Tech" },
    { courseCode: "BT-09", courseName: "Biotechnology", duration: 4, department: "Biotech", courseType: "B.Tech" },
    { courseCode: "FT-10", courseName: "Food Technology", duration: 4, department: "Food Tech", courseType: "B.Tech" },
    { courseCode: "AIML-11", courseName: "Artificial Intelligence & Machine Learning", duration: 4, department: "CSE", courseType: "B.Tech" },
    { courseCode: "DS-12", courseName: "Data Science", duration: 4, department: "CSE", courseType: "B.Tech" },
    { courseCode: "CST-13", courseName: "Cyber Security", duration: 4, department: "CSE", courseType: "B.Tech" },
    { courseCode: "IOT-14", courseName: "Internet of Things", duration: 4, department: "CSE", courseType: "B.Tech" },
    { courseCode: "ROBO-15", courseName: "Robotics & Automation", duration: 4, department: "Mechanical", courseType: "B.Tech" },
    { courseCode: "CSE-16", courseName: "Computer Science & Engineering", duration: 2, department: "CSE", courseType: "M.Tech" },
    { courseCode: "AI-17", courseName: "Artificial Intelligence", duration: 2, department: "CSE", courseType: "M.Tech" },
    { courseCode: "ML-18", courseName: "Machine Learning", duration: 2, department: "CSE", courseType: "M.Tech" },
    { courseCode: "SE-19", courseName: "Software Engineering", duration: 2, department: "CSE", courseType: "M.Tech" },
    { courseCode: "CS-20", courseName: "Cyber Security", duration: 2, department: "CSE", courseType: "M.Tech" },
    { courseCode: "IOT-21", courseName: "Internet of Things", duration: 2, department: "CSE", courseType: "M.Tech" },
    { courseCode: "DS-22", courseName: "Data Science", duration: 2, department: "CSE", courseType: "M.Tech" },
    { courseCode: "RA-23", courseName: "Robotics & Automation", duration: 2, department: "Mechanical", courseType: "M.Tech" },
    { courseCode: "VLSI-24", courseName: "VLSI Design", duration: 2, department: "ECE", courseType: "M.Tech" },
    { courseCode: "EM-25", courseName: "Embedded Systems", duration: 2, department: "ECE", courseType: "M.Tech" },
    { courseCode: "PE-26", courseName: "Power Electronics", duration: 2, department: "EEE", courseType: "M.Tech" },
    { courseCode: "CN-27", courseName: "Computer Networks", duration: 2, department: "CSE", courseType: "M.Tech" },
    { courseCode: "CE-28", courseName: "Structural Engineering", duration: 2, department: "Civil", courseType: "M.Tech" },
    { courseCode: "TE-29", courseName: "Thermal Engineering", duration: 2, department: "Mechanical", courseType: "M.Tech" },
    { courseCode: "BIO-30", courseName: "Biomedical Engineering", duration: 2, department: "Biotech", courseType: "M.Tech" }
];

// Insert into DB
Course.insertMany(courses)
    .then(() => {
        c("Courses inserted successfully!");
        mongoose.connection.close();
    })
    .catch((error) => {
        console.error("Error inserting courses:", error);
    });
