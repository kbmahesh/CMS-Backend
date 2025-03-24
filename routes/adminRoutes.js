import express from "express";
import Course from "../models/Course.js";
import Student from "../models/Student.js";
import FeeType from "../models/FeeType.js";
import User from "../models/User.js";
import Fee from "../models/Fee.js"
import Transaction from "../models/Transaction.js"

const router = express.Router();
// API to fetch branches based on selected course
router.get("/get-branches", async (req, res) => {
    try {
        const { course } = req.query;

        // Find all courses matching the courseType (B.Tech or M.Tech)
        const courseData = await Course.find({ courseType: course });

        if (courseData.length > 0) {
            // Extract branches from all matching course documents
            const branches = courseData.flatMap(course => ({
                courseCode: course.courseCode,
                courseName: course.courseName,
                department: course.department
            }));

            res.json(branches);
        } else {
            res.status(404).json({ message: "No branches found for this course type" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching branches", error: error.message });
    }
});

router.get("/get-branch", async (req, res) => {
    try {
        const { course } = req.query;

        // Find all courses matching the courseType (B.Tech or M.Tech)
        const courseData = await Course.find();

        if (courseData.length > 0) {
            // Extract branches from all matching course documents
            const branches = courseData.flatMap(course => ({
                courseCode: course.courseCode,
                courseName: course.courseName,
                department: course.department
            }));

            res.json(branches);
        } else {
            res.status(404).json({ message: "No branches found for this course type" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching branches", error: error.message });
    }
});

router.post("/register-student", async (req, res) => {
    try {
        const { first_name, last_name, gender, email, student_id, phone, dob, address, 
                course, course_id, semester, admission_date, 
                guardian_name, guardian_relation, guardian_phone } = req.body;
        
        // Check if email or student ID already exists
        const existingUser = await User.findOne({ email });
        const existingStudent = await Student.findOne({ student_id });

        if (existingUser || existingStudent) {
            return res.status(400).json({ message: "Student ID or Email already exists!" });
        }

        // Generate default password
        const generateDefaultPassword = (first_name, last_name, dob) => {
            // Extract birth year from DOB (assuming format "YYYY-MM-DD")
            const birthYear = dob.split("-")[0];
        
            // Get the first letter of the last name
            const lastInitial = last_name.charAt(0).toUpperCase();
        
            // Generate default password (e.g., "John@D2000")
            return `${first_name}@${lastInitial}${birthYear}`;
        };
        
        const defaultPassword = generateDefaultPassword(first_name,last_name,dob);

        // const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        // Create User credentials
        const user = new User({
            name: `${first_name} ${last_name}`,
            email:email,
            password: defaultPassword, // Store the hashed default password
            role: "student",
            student_id
        });

        // Create Student record
        const student = new Student({
            first_name, 
            last_name, 
            gender, 
            email, 
            student_id, 
            phone, 
            dob, 
            address,
            guardian: { guardian_name, guardian_relation, guardian_phone },
            academic: { course, course_id, semester, admission_date }
        });

        // Save both User and Student
        await user.save();
        await student.save();
        
        res.status(201).json({ 
            message: "Student registered successfully!", 
            defaultPassword: defaultPassword // Send the default password in response
        });

    } catch (error) {
        res.status(500).json({ message: "Error registering student", error });
    }
});

router.get("/get-student/:id", async (req, res) => {
    try {
        const student = await Student.findOne({ student_id: req.params.id }).lean();

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: "Error fetching student details", error });
    }
});

router.get("/get-fees/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Find student details
        const student = await Student.findOne({ student_id: id }).lean();
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Fetch fees separately from the Fee collection
        const fees = await Fee.find({ student_id: student.student_id }).lean();

        // Calculate fee summary
        let totalFees = 0;
        let totalPaid = 0;
        let totalDue = 0;
        let paymentStatus = "Pending";

        if (fees.length > 0) {
            totalFees = fees.reduce((sum, fee) => sum + (fee.total_fees || 0), 0);
            totalPaid = fees.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
            totalDue = totalFees - totalPaid;

            if (totalDue === 0 && totalFees > 0) {
                paymentStatus = "Paid";
            } else if (totalPaid > 0) {
                paymentStatus = "Partially Paid";
            }
        }

        // Return student details along with fees
        res.json({
            student,
            fees,
            feeSummary: {
                totalFees,
                totalPaid,
                totalDue,
                paymentStatus,
            },
        });
    } catch (error) {
        console.error("Error fetching student details:", error);
        res.status(500).json({ message: "Error fetching student details", error });
    }
});
// Route: PUT /api/students/:id (Update Student)
router.put("/update-student/:id",  async (req, res) => {
    try {
        const updatedStudent = await Student.findOneAndUpdate(
            { student_id: req.params.id },
            { $set: req.body },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedStudent) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json(updatedStudent);
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route: GET /api/students/filter
router.get("/get-students", async (req, res) => {
    try {
        const { student_id, branch, course, semester, page = 1, limit = 10 } = req.query;

        let filter = {};
        if (student_id) filter.student_id = student_id;
        if (branch) filter["academic.branch"] = branch;
        if (course) filter["academic.course"] = course;
        if (semester) filter["academic.semester"] = semester;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        const students = await Student.find(filter).skip(skip).limit(limitNumber).lean();
        const totalStudents = await Student.countDocuments(filter);

        res.json({
            students,
            totalPages: Math.ceil(totalStudents / limitNumber),
            currentPage: pageNumber
        });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/addfees", async (req, res) => {
    try {
        const { student_id, fee_category, amount, due_date } = req.body;

        // ✅ Find Student
        const student = await Student.findOne({ student_id });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // ✅ Create and Save Fee in `Fee` Collection
        const newFee = new Fee({
            student_id: student._id,
            academic_year: new Date().getFullYear().toString(), // Current academic year
            fee_type: fee_category,
            total_fees: amount,
            paid_amount: 0, // Initially 0
            due_amount: amount, // Full amount due initially
            payment_date: null, // No payment yet
            next_due_date: due_date, // User sets due date
            payment_status: "Pending", // Default status
            payment_mode: "Not Paid" // Default mode
        });

        await newFee.save();

        res.status(201).json({ message: "Fee added successfully", fee: newFee });
    } catch (error) {
        console.error("Error adding fee:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});

// Get all fee types
router.get("/fee-types", async (req, res) => {
    try {
        const feeTypes = await FeeType.find();
        res.json(feeTypes);
    } catch (error) {
        res.status(500).json({ error: "Error fetching fee types" });
    }
});

// Fetch pending transactions
router.get("/transactions/pending", async (req, res) => {
    try {
        const transactions = await Transaction.find({ status: "Pending" }).lean();
        
        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch pending transactions
router.get("/transactions/:id", async (req, res) => {
    try {
        const transactions = await Transaction.find({ _id: req.params.id }).lean();
        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Approve Payment
router.put("/transactions/approve/:id", async (req, res) => {
    
    try {
        // Find the transaction
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        // Check if it's already approved
        if (transaction.status === "Approved") {
            return res.status(400).json({ error: "Transaction already approved" });
        }

        // Find the related fee entry
        const feeRecord = await Fee.findById(req.params.id);

        if (!feeRecord) {
            return res.status(404).json({ error: "Fee record not found" });
        }

        // Update transaction status
        transaction.status = "Approved";
        await transaction.save();

        // Update fee record (reduce due amount)
        feeRecord.paid_amount += transaction.amount;
        feeRecord.due_amount -= transaction.amount;
        feeRecord.payment_status = "Paid";
        feeRecord.payment_date = new Date(); // Set current date
        feeRecord.payment_mode = transaction.payment_mode || "Not Paid"; // Use transaction mode
        await feeRecord.save();

        res.json({ message: "Payment approved successfully" });
    } catch (error) {
        console.error("Error approving payment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;