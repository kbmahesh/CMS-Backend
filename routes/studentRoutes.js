import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js"
import Fee from "../models/Fee.js"
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js"
import { getStudentsWithFees } from "../controllers/studentController.js";

const router = express.Router();

// API route to fetch students with fee summary
router.get("/students", getStudentsWithFees);

// Get fees for logged-in student
router.get("/get-fees", authenticate, async (req, res) => {
  try {
      const studentId = req.user.student_id; // Extract student_id from authMiddleware

      // Fetch fees for the logged-in student
      const fees = await Fee.find({ student_id: studentId }).lean();

      if (!fees.length) {
          return res.status(404).json({ message: "No fee records found" });
      }

      // Calculate fee summary
      let totalFees = fees.reduce((sum, fee) => sum + (fee.total_fees || 0), 0);

      let totalPaid = fees.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
      let totalDue = totalFees - totalPaid;
      let paymentStatus = totalDue === 0 ? "Paid" : totalPaid > 0 ? "Partially Paid" : "Pending";

      res.json({
          fees,
          feeSummary: {
              totalFees,
              totalPaid,
              totalDue,
              paymentStatus,
          },
      });

  } catch (error) {
      console.error("Error fetching fee details:", error);
      res.status(500).json({ message: "Error fetching fee details", error });
  }
});

// ✅ Route to process payment submission
router.post("/pay-now", async (req, res) => {
    try {
      const { transaction_id, student_id, fee_type_id, amount, paymentMode, payment_proof } = req.body;

      // Validate required fields
      if (!transaction_id || !student_id || !fee_type_id || !amount || !paymentMode || !payment_proof) {
          return res.status(400).json({ error: "All fields are required" });
      }

      // Convert fee_type_id to ObjectId for proper linking
      const feeTypeObjectId = new mongoose.Types.ObjectId(transaction_id);

      // Find the exact Fee record that matches student_id and fee_type_id
      const feeRecord = await Fee.findOne({ student_id, _id: feeTypeObjectId });

      if (!feeRecord) {
          return res.status(404).json({ error: "Fee record not found." });
      }

      // Check if there's already a pending payment for this specific fee type
      const existingTransaction = await Transaction.findOne({
          _id: feeTypeObjectId, // ✅ Transaction ID should be the same as Fee ID
          status: "Pending"
      });

      if (existingTransaction) {
          return res.status(201).json({ message: "A pending payment already exists for this fee type." });
      }

      if (feeRecord.due_amount < amount) {
          return res.status(400).json({ error: "Payment amount exceeds due amount." });
      }

      // Create transaction with the same _id as fee_id
      const newTransaction = new Transaction({
          _id: feeTypeObjectId, // ✅ Using fee_id as transaction_id
          student_id: student_id,
          fee_type_id: fee_type_id,
          amount:amount,
          payment_mode:paymentMode,
          payment_proof:payment_proof, // Base64 string
          status: "Pending"
      });

      await newTransaction.save();

      res.status(201).json({
          message: "Payment submitted successfully. Waiting for admin approval.",
          transaction: newTransaction
      });

    } catch (error) {
        console.error("Error submitting payment:", error);
        res.status(500).json({ error: "Server Error" });
    }
  });

// Fetch pending transactions
router.get("/transactions", authenticate, async (req, res) => {
  try {
      const studentId = req.user.student_id; // Extract logged-in user ID from auth middleware

      // Fetch pending transactions only for the logged-in user
      const transactions = await Transaction.find({ student_id: studentId }).lean();

      res.json(transactions);
  } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;