import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/auth';
import upload from '../middleware/upload';
import {
  submitPersonalDetails,
  uploadDocument,
  configureLoan,
  getLoans,
  getLoan,
  reviewLoan,
  sanctionLoan,
  disburseLoan,
  recordPayment,
  getAdminStats
} from '../controllers/loanController';

// Borrower flow
router.post('/step1', protect, authorize('borrower'), submitPersonalDetails);
router.post('/:id/upload', protect, authorize('borrower'), upload.single('document'), uploadDocument);
router.post('/:id/configure', protect, authorize('borrower'), configureLoan);

// Viewing loans (multi-role)
router.get('/', protect, getLoans);
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
router.get('/:id', protect, getLoan);

// Role-specific actions
router.patch('/:id/review', protect, authorize('sanction_officer', 'admin'), reviewLoan);
router.patch('/:id/sanction', protect, authorize('sanction_officer', 'admin'), sanctionLoan);
router.patch('/:id/disburse', protect, authorize('disbursement_executive', 'admin'), disburseLoan);
router.post('/:id/payment', protect, authorize('collection_officer', 'admin'), recordPayment);

export default router;
