import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getStats, getSubmissions } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/stats', getStats);
router.get('/submissions', getSubmissions);

export default router;
