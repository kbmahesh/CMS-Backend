const Student = require("../models/Student");
const Fee = require("../models/Fee");

// Fetch students with paginated fee summary
const getStudentsWithFees = async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Default values
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of students
        const totalStudents = await Student.countDocuments();
        
        // Fetch students with pagination
        const students = await Student.find().skip(skip).limit(limit).lean();

        // Get student_id list for fee lookup
        const studentIds = students.map(student => student.student_id); // Use `student_id` (String)

        // Fetch fees for all students in one query
        const fees = await Fee.find({ student_id: { $in: studentIds } }).lean();

        // Group fees by student_id for quick lookup
        const feeMap = {};
        fees.forEach(fee => {
            const id = fee.student_id; // Already a String
            if (!feeMap[id]) {
                feeMap[id] = [];
            }
            feeMap[id].push(fee);
        });

        // Process each student to calculate fee summary
        const processedStudents = students.map(student => {
            const studentFees = feeMap[student.student_id] || [];

            let totalFees = 0;
            let totalPaid = 0;
            let totalDue = 0;
            let paymentStatus = "Pending";

            if (studentFees.length > 0) {
                totalFees = studentFees.reduce((sum, fee) => sum + (fee.total_fees || 0), 0);
                totalPaid = studentFees.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
                totalDue = totalFees - totalPaid;

                if (totalDue === 0 && totalFees > 0) {
                    paymentStatus = "Paid";
                } else if (totalPaid > 0) {
                    paymentStatus = "Partially Paid";
                }
            }

            // Exclude students with no assigned fees
            if (totalFees === 0) {
                return null;
            }

            return {
                ...student,
                feeSummary: {
                    totalFees,
                    totalPaid,
                    totalDue,
                    paymentStatus
                }
            };
        }).filter(student => student !== null); // Remove null values

        res.json({
            students: processedStudents,
            totalPages: Math.ceil(totalStudents / limit),
            currentPage: page,
            totalStudents: processedStudents.length,
        });

    } catch (err) {
        console.error("Error fetching students with fees:", err);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = { getStudentsWithFees };