import express from "express";
import FeatureFlag from "../models/FeatureFlag.js";
import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * GET /company/config
 * Returns merged config: global flags + plan flags + company flags + plan limits
 */
router.get("/config", requireAuth, async (req, res) => {
  try {
    const { companyId, role } = req.user;

    // Super admin has no company config
    if (!companyId && role === "SUPER_ADMIN") {
      const global = await FeatureFlag.findOne({ scope: "GLOBAL", scopeId: null });
      return res.json({
        companyId: null,
        plan: null,
        limits: null,
        flags: global?.flags || {},
      });
    }

    if (!companyId) return res.status(400).json({ message: "companyId missing in token" });

    const sub = await Subscription.findOne({ companyId, status: "ACTIVE" });
    let plan = null;
    let planIdStr = null;
    if (sub) {
      plan = await Plan.findById(sub.planId);
      planIdStr = plan?._id?.toString() || null;
    }

    const global = await FeatureFlag.findOne({ scope: "GLOBAL", scopeId: null });
    const planFlags = planIdStr ? await FeatureFlag.findOne({ scope: "PLAN", scopeId: planIdStr }) : null;
    const companyFlags = await FeatureFlag.findOne({ scope: "COMPANY", scopeId: companyId });

    // Merge priority: global < plan default < plan override < company override
    const mergedFlags = {
      ...(global?.flags || {}),
      ...(plan?.defaultFeatures || {}),
      ...(planFlags?.flags || {}),
      ...(companyFlags?.flags || {}),
    };

    res.json({
      companyId,
      plan: plan ? { id: plan._id, name: plan.name } : null,
      limits: plan?.limits || null,
      flags: mergedFlags,
    });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

export default router;
