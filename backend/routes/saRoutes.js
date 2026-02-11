import express from 'express';
import * as companiesController from '../controllers/sa/companiesController.js';
import * as plansController from '../controllers/sa/plansController.js';

const router = express.Router();

// Middleware to check if user is SuperAdmin would go here
// router.use(requireSuperAdmin);

// Companies
router.get('/dashboard-stats', companiesController.getDashboardStats); // New Metric Route
router.get('/companies', companiesController.getCompanies);
router.get('/companies/:id', companiesController.getCompanyById);
router.post('/companies', companiesController.createCompany);
router.patch('/companies/:id/status', companiesController.updateCompanyStatus);
router.patch('/companies/:id/plan', companiesController.updateCompanyPlan);
router.patch('/companies/:id/flags', companiesController.updateCompanyFlags);
router.delete('/companies/:id', companiesController.deleteCompany);

// Plans
router.get('/plans', plansController.getPlans);
router.post('/plans', plansController.createPlan);
router.patch('/plans/:id', plansController.updatePlan);
router.patch('/plans/:id/archive', plansController.archivePlan);

export default router;
