import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register-company', authController.registerCompany);
router.post('/login', authController.login);
// router.post('/google', authController.googleLogin);

export default router;
