import express from "express";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { sendPlanRequestEmail } from "../utils/mailer.js";

const router = express.Router();

const getStripeSecret = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured.");
  }
  return process.env.STRIPE_SECRET_KEY;
};

const ensureCompanyId = async (user) => {
  if (user.companyId) return user.companyId;
  const companyId = `cmp_${user._id}`;
  user.companyId = companyId;
  await user.save();
  return companyId;
};

const resolveSubscriptionEnd = (billingCycle) => {
  if (!billingCycle) return null;
  const endAt = new Date();
  if (billingCycle === "MONTHLY") {
    endAt.setMonth(endAt.getMonth() + 1);
    return endAt;
  }
  if (billingCycle === "YEARLY") {
    endAt.setFullYear(endAt.getFullYear() + 1);
    return endAt;
  }
  return null;
};

const activateSubscription = async ({ companyId, plan }) => {
  const endAt = resolveSubscriptionEnd(plan.billingCycle);
  const existing = await Subscription.findOne({ companyId, status: "ACTIVE" });

  if (existing) {
    existing.planId = plan._id;
    existing.startAt = new Date();
    existing.endAt = endAt;
    await existing.save();
    return existing;
  }

  return Subscription.create({
    companyId,
    planId: plan._id,
    status: "ACTIVE",
    startAt: new Date(),
    endAt,
  });
};

const sendAdminNotice = async ({ user, plan }) => {
  if (!process.env.ADMIN_EMAIL) return;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  await sendPlanRequestEmail({
    adminEmail: process.env.ADMIN_EMAIL,
    customer: {
      name: user.fullName,
      email: user.email,
      phone: user.phone,
    },
    plan,
  });
};

const createStripeSession = async ({ plan, user, companyId, successUrl, cancelUrl }) => {
  const secret = getStripeSecret();
  const amount = Math.round(Number(plan.price) * 100);
  const currency = process.env.STRIPE_CURRENCY || "usd";

  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", successUrl || process.env.STRIPE_SUCCESS_URL || "https://example.com/success");
  params.append("cancel_url", cancelUrl || process.env.STRIPE_CANCEL_URL || "https://example.com/cancel");
  params.append("customer_email", user.email);
  params.append("metadata[planId]", plan._id.toString());
  params.append("metadata[companyId]", companyId);
  params.append("metadata[userId]", user._id.toString());
  params.append("line_items[0][quantity]", "1");
  params.append("line_items[0][price_data][currency]", currency);
  params.append("line_items[0][price_data][product_data][name]", plan.name);
  params.append("line_items[0][price_data][unit_amount]", String(amount));

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Stripe error: ${response.status} ${errorBody}`);
  }

  return response.json();
};

const verifyStripeSignature = ({ payload, signatureHeader }) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Stripe webhook secret not configured.");
  }

  const elements = signatureHeader.split(",").reduce((acc, item) => {
    const [key, value] = item.split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  const timestamp = elements.t;
  const signature = elements.v1;

  if (!timestamp || !signature) {
    throw new Error("Invalid stripe signature header.");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== signatureBuffer.length) {
    throw new Error("Stripe signature mismatch.");
  }

  if (!crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    throw new Error("Stripe signature mismatch.");
  }
};

router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body || {};

    if (!planId) {
      return res.status(400).json({ message: "planId is required." });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: "Plan not found." });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const companyId = await ensureCompanyId(user);

    if (plan.price <= 0) {
      await activateSubscription({ companyId, plan });
      await sendAdminNotice({ user, plan });
      return res.json({
        status: "ACTIVE",
        message: "Subscription activated (free plan)",
      });
    }

    const session = await createStripeSession({ plan, user, companyId, successUrl, cancelUrl });

    await Payment.create({
      userId: user._id,
      companyId,
      planId: plan._id,
      provider: "STRIPE",
      providerSessionId: session.id,
      status: "PENDING",
      amount: plan.price,
      currency: process.env.STRIPE_CURRENCY || "usd",
    });

    return res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

export const handleStripeWebhook = async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({ message: "Missing stripe signature" });
    }

    const payload = req.body.toString("utf8");
    verifyStripeSignature({ payload, signatureHeader: signature });

    const event = JSON.parse(payload);

    if (event.type === "checkout.session.completed") {
      const session = event.data?.object;
      const payment = await Payment.findOne({ providerSessionId: session.id });

      if (payment && payment.status !== "PAID") {
        payment.status = "PAID";
        await payment.save();

        const plan = await Plan.findById(payment.planId);
        if (plan) {
          await activateSubscription({ companyId: payment.companyId, plan });
          const user = await User.findById(payment.userId);
          if (user) {
            await sendAdminNotice({ user, plan });
          }
        }
      }
    }

    return res.json({ received: true });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Webhook error" });
  }
};

export default router;
