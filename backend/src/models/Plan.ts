import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    price: { type: Number, default: 0 },
    billingCycle: { type: String, enum: ["MONTHLY", "YEARLY", "CUSTOM"], default: "MONTHLY" },
    limits: {
      users: { type: Number, default: 3 },
      invoices: { type: Number, default: 200 },
      inventoryItems: { type: Number, default: 500 },
      aiCredits: { type: Number, default: 1000 },
      devices: { type: Number, default: 1 }
    },
    defaultFeatures: { type: Object, default: {} },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);
