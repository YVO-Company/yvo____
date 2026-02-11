
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/Global/User.js';
import { Company } from '../models/Global/Company.js';
import { Plan } from '../models/Global/Plan.js';

dotenv.config();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', {
        expiresIn: '30d',
    });
};

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

// Create Order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Something went wrong while creating order' });
    }
});

// Verify Payment & Create Account
router.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            // User Details from Frontend
            name,
            email,
            password,
            phone,
            planId
        } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        // --- ACCOUNT CREATION LOGIC ---

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            // Payment succeeded but user exists. In a real app, handle this carefully (credit account?).
            // For now, return error asking to login, or maybe updating checking logic.
            return res.json({
                success: true,
                message: 'Payment received. User already exists, please login.',
                warning: 'User already exists'
            });
        }

        // 2. Resolve Plan
        let plan = await Plan.findOne({ code: planId?.toUpperCase() });
        if (!plan && planId) {
            plan = await Plan.findOne({ code: 'BASIC' });
        }
        if (!plan) {
            plan = await Plan.create({ code: 'BASIC', name: 'Starter', priceMonthly: 0 });
        }

        // 3. Create Company
        const apiKey = `sk_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const company = await Company.create({
            name: `${name}'s Company`,
            planId: plan._id,
            subscriptionStatus: 'active',
            featureFlags: plan.defaultFlags || {},
            apiKey
        });

        // 4. Create Owner (Company Admin)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password || 'password123', salt); // fallback password if missing

        const user = await User.create({
            fullName: name,
            email,
            passwordHash,
            memberships: [{
                companyId: company._id,
                role: 'OWNER'
            }],
            isSuperAdmin: false
        });

        // 5. Return Success + Token for Auto-Login
        res.json({
            success: true,
            message: 'Payment verified and account created successfully',
            token: generateToken(user._id),
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: 'owner',
                memberships: user.memberships,
                currentCompanyId: company._id
            }
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default router;
