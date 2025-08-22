import express from 'express';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';
import {
  getAllReservations,
  getMyReservations,
  adminManageReservation,
  cancelReservation,
  updateFineExpiryDate,
  getTotalReservations,
} from '../controllers/reservationController.js';

const router = express.Router();

router.route('/').get(protectAdmin, getAllReservations);
router.route('/my').get(protect, getMyReservations);
router.route('/:id/status').put(protectAdmin, adminManageReservation);
router.route('/:id/cancel').put(protect, cancelReservation);
router.route('/:id/fine-expiry').put(protectAdmin, updateFineExpiryDate);
router.route('/count').get(protectAdmin, getTotalReservations);

export default router;
