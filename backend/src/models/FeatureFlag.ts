import mongoose from "mongoose";

const featureFlagSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ["GLOBAL", "PLAN", "COMPANY"], required: true },
    scopeId: { type: String, default: null }, // null (global), planId string, or companyId
    flags: { type: Object, default: {} }
  },
  { timestamps: true }
);

featureFlagSchema.index({ scope: 1, scopeId: 1 }, { unique: true });

export default mongoose.model("FeatureFlag", featureFlagSchema);
