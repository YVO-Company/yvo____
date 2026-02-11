import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import { signToken } from "../utils/jwt.js";
import { sendWelcomeEmail } from "../utils/mailer.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const normalizeEmail = (email) => String(email || "").toLowerCase().trim();
const normalizePhone = (phone) => String(phone || "").replace(/[^\d+]/g, "").trim();

const ensureCompanyId = async (user) => {
  if (user.companyId) return user.companyId;
  const companyId = `cmp_${user._id}`;
  await User.findByIdAndUpdate(user._id, { companyId });
  return companyId;
};

const getNeedsPlan = async (companyId) => {
  if (!companyId) return true;
  const active = await Subscription.findOne({ companyId, status: "ACTIVE" });
  return !active;
};

/* =========================
   REGISTER (Create Account)
   POST /auth/register
========================= */
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password, businessType, companyId, role } = req.body || {};

    if (!fullName || String(fullName).trim().length < 2) {
      return res.status(400).json({ message: "Full name is required." });
    }

    const e = normalizeEmail(email);
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ message: "Valid email is required." });
    }

    if (!password || String(password).trim().length < 6) {
      return res.status(400).json({ message: "Password is required (min 6 chars)." });
    }

    const existing = await User.findOne({ email: e });
    if (existing) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const p = phone ? normalizePhone(phone) : null;

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: e,
      phone: p,
      businessType: businessType || null,
      companyId: companyId || null,
      role: role || "COMPANY_OWNER",
      passwordHash,
      status: "ACTIVE",
    });

    const finalCompanyId = await ensureCompanyId(user);
    const needsPlan = await getNeedsPlan(finalCompanyId);

    const token = signToken({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      companyId: finalCompanyId,
      role: user.role,
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendWelcomeEmail({ to: user.email, name: user.fullName });
    }

    return res.status(201).json({
      message: "Account created ✅",
      token,
      needsPlan,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        businessType: user.businessType,
        companyId: finalCompanyId,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

/* =========================
   LOGIN
   POST /auth/login
========================= */
router.post("/login", async (req, res) => {
  try {
    const { method, email, phone, password } = req.body || {};

    if (!password || String(password).trim().length < 6) {
      return res.status(400).json({ message: "Password is required (min 6 chars)." });
    }

    let user = null;

    if (method === "email") {
      const e = normalizeEmail(email);
      if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        return res.status(400).json({ message: "Valid email is required." });
      }
      user = await User.findOne({ email: e });
    } else if (method === "phone") {
      const p = normalizePhone(phone);
      if (!p || p.replace(/[^\d]/g, "").length < 7) {
        return res.status(400).json({ message: "Valid phone is required." });
      }
      user = await User.findOne({ phone: p });
    } else {
      return res.status(400).json({ message: "Invalid login method. Use 'email' or 'phone'." });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // ✅ IMPORTANT: compare with passwordHash
    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const finalCompanyId = await ensureCompanyId(user);
    const needsPlan = await getNeedsPlan(finalCompanyId);

    const token = signToken({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      companyId: finalCompanyId,
      role: user.role,
    });

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      token,
      needsPlan,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        businessType: user.businessType,
        companyId: finalCompanyId,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

/* =========================
   GOOGLE LOGIN
   POST /auth/google
========================= */
router.post("/google", async (req, res) => {
  try {
    const { idToken, businessType } = req.body || {};

    if (!idToken) {
      return res.status(400).json({ message: "Google idToken is required." });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google OAuth is not configured." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ message: "Google payload missing email." });
    }

    const email = normalizeEmail(payload.email);
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        fullName: payload.name || "Google User",
        email,
        phone: null,
        businessType: businessType || null,
        passwordHash,
        googleId: payload.sub,
        authProvider: "GOOGLE",
        status: "ACTIVE",
      });

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await sendWelcomeEmail({ to: user.email, name: user.fullName });
      }
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      user.authProvider = "GOOGLE";
      await user.save();
    }

    const finalCompanyId = await ensureCompanyId(user);
    const needsPlan = await getNeedsPlan(finalCompanyId);

    const token = signToken({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      companyId: finalCompanyId,
      role: user.role,
    });

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      token,
      needsPlan,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        businessType: user.businessType,
        companyId: finalCompanyId,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
