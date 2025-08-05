import express from 'express';
import { createSupportRequest, getAllSupportRequests, updateSupportRequest } from '../controllers/supportController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(createSupportRequest);
router.route('/').get(protectAdmin, getAllSupportRequests);
router.route('/:id').put(protectAdmin, updateSupportRequest);

export default router;
