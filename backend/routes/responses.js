import express from 'express';
import {
  submitResponse,
  getFormResponses,
  getResponse,
  deleteResponse
} from '../controllers/responseController.js';
import { validateResponse } from '../middleware/validation.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public route for submitting responses
router.post('/', optionalAuth, validateResponse, submitResponse);

// Protected routes for viewing/managing responses
router.use(authenticate);

router.get('/:id', getResponse);
router.delete('/:id', deleteResponse);

export default router;