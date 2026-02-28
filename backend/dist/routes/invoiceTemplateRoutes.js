import express from 'express';
import { getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate } from '../controllers/invoiceTemplateController.js';
const router = express.Router();
router.get('/', getTemplates);
router.post('/', createTemplate);
router.get('/:id', getTemplateById);
router.patch('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
export default router;
