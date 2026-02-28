import express from 'express';
import * as backupController from '../controllers/backupController.js';
import { requireAuth } from '../src/middleware/auth.middleware.js';
import { requireRoles } from '../src/middleware/role.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRoles('OWNER', 'ADMIN', 'SUPER_ADMIN'), backupController.createBackup);
router.get('/', requireRoles('OWNER', 'ADMIN', 'SUPER_ADMIN'), backupController.getBackups);
router.get('/:id/status', requireRoles('OWNER', 'ADMIN', 'SUPER_ADMIN'), backupController.getBackupStatus);
router.get('/:id/download', requireRoles('OWNER', 'ADMIN', 'SUPER_ADMIN'), backupController.downloadBackup);
router.delete('/:id', requireRoles('OWNER', 'ADMIN', 'SUPER_ADMIN'), backupController.deleteBackup);

export default router;
