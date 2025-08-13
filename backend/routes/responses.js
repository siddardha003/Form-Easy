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

// All routes now require authentication
router.use(authenticate);

// Route for submitting responses (now requires authentication)
router.post('/', validateResponse, submitResponse);

// Routes for viewing/managing responses
router.get('/:id', getResponse);
router.delete('/:id', deleteResponse);

export default router;