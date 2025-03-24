import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  fee_type_id: { type: String, required: true },
  // fee_name: { type: String, required: true },
  amount: { type: Number, required: true },
  payment_mode: { type: String, enum: ["Bank Transfer", "UPI"], required: true },
  payment_proof: { type: String, required: true }, // ✅ Base64 image string
  status: { type: String, enum: ["Pending", "Approved"], default: "Pending" },
  date: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;