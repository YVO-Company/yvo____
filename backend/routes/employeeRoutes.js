import express from 'express';
import * as employeeController from '../controllers/modules/employeeController.js';
import { checkSubscriptionStatus } from '../middleware/subscriptionMiddleware.js';

const router = express.Router();

// READ-ONLY Check
router.use(checkSubscriptionStatus);

// Employees
router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

// Salary
router.get('/salary-records', employeeController.getSalaryRecords); // Specific path before :id
router.post('/:id/pay', employeeController.paySalary);
router.get('/:id/calculate-salary', employeeController.calculateSalary);

// Leaves
router.get('/leaves', employeeController.getLeaveRequests); // Specific path before :id
router.patch('/leaves/:id', employeeController.updateLeaveStatus);

// Broadcasts (Groups)
router.post('/groups', employeeController.createBroadcastGroup);
router.get('/groups', employeeController.getBroadcastGroups);
router.put('/groups/:id', employeeController.updateBroadcastGroup);
router.delete('/groups/:id', employeeController.deleteBroadcastGroup);

// Broadcasts (Messages)
router.post('/send-message', employeeController.sendBroadcastMessage);

export default router;
