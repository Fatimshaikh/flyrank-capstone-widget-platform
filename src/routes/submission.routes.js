import { Router } from 'express';
import cors from 'cors';
import { create } from '../controllers/submission.controller.js';
import { submissionRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

const publicCors = cors({ origin: true, methods: ['GET', 'POST', 'OPTIONS'] });

// router.use (not router.post) so this also handles the browser's
// automatic OPTIONS preflight request, not just the real POST
router.use(publicCors);

router.post('/', submissionRateLimit, create);

export default router;
