const mongoose = require("mongoose");
const FeeType = require("./models/FeeType"); // Import the model

mongoose.connect("mongodb://localhost:27017/campusSmartCard", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection failed!", err));

const feeTypes = [
    { fee_type_id: "FT001", fee_name: "Tuition Fee", description: "Annual tuition fee for students" },
    { fee_type_id: "FT002", fee_name: "Library Fee", description: "Library maintenance and book access fee" },
    { fee_type_id: "FT003", fee_name: "Sports Fee", description: "Fee for sports activities and facilities" },
    { fee_type_id: "FT004", fee_name: "Hostel Fee", description: "Accommodation charges for hostel students" },
    { fee_type_id: "FT005", fee_name: "Exam Fee", description: "Fee for semester and annual exams" }
];

const insertFeeTypes = async () => {
    try {
        await FeeType.insertMany(feeTypes);

        mongoose.connection.close();
    } catch (error) {
        console.error("Error inserting data:", error);
    }
};

insertFeeTypes();
