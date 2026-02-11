import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    status: { type: String, enum: ["TRIAL", "ACTIVE", "EXPIRED"], default: "TRIAL" },
    startAt: { type: Date, default: Date.now },
    endAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
