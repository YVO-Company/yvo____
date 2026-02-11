import express from "express";
import Plan from "../models/Plan.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    return res.json({ plans });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  try {
    const { name, price, billingCycle, limits, defaultFeatures, isActive } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: "Plan name is required." });
    }

    const plan = await Plan.create({
      name,
      price: Number(price || 0),
      billingCycle: billingCycle || "MONTHLY",
      limits: limits || undefined,
      defaultFeatures: defaultFeatures || {},
      isActive: isActive !== false,
    });

    return res.status(201).json({ plan });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
