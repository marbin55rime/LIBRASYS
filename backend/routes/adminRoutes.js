import express from 'express';
import { adminLogin, protectAdmin, getUnapprovedUsers, getAllUsers, updateUserApprovalStatus } from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/users/unapproved', protectAdmin, getUnapprovedUsers);
router.get('/users/all', protectAdmin, getAllUsers); 
router.put('/users/:id/status', protectAdmin, updateUserApprovalStatus);

export default router;
