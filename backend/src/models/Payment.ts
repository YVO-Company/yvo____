import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyId: { type: String, required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    provider: { type: String, enum: ["STRIPE"], default: "STRIPE" },
    providerSessionId: { type: String, required: true, index: true },
    status: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
