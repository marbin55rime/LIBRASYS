import express from 'express';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { addCategory, getCategories, updateCategory, deleteCategory, getTotalCategories } from '../controllers/categoryController.js';

const router = express.Router();

router.route('/').post(protectAdmin, addCategory).get(getCategories);
router.route('/count').get(protectAdmin, getTotalCategories);
router.route('/:id').put(protectAdmin, updateCategory).delete(protectAdmin, deleteCategory);

export default router;
