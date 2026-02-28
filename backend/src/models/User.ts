import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    companyId: { type: String, default: null, index: true },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "COMPANY_OWNER", "COMPANY_ADMIN", "EMPLOYEE"],
      default: "COMPANY_OWNER",
    },

    authProvider: {
      type: String,
      enum: ["PASSWORD", "GOOGLE"],
      default: "PASSWORD",
    },

    googleId: { type: String, default: null, index: true },

    fullName: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: { type: String, default: null },
    businessType: { type: String, default: null },

    passwordHash: { type: String, required: true },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },

    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
