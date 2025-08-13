import express from 'express';
import {
  getForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  togglePublishForm,
  duplicateForm
} from '../controllers/formController.js';
import { getFormResponses } from '../controllers/responseController.js';
import { validateForm } from '../middleware/validation.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Routes that require authentication
router.use(authenticate);

// Form CRUD operations
router.route('/')
  .get(getForms)
  .post(validateForm, createForm);

router.route('/:id')
  .get(getForm)
  .put(validateForm, updateForm)
  .delete(deleteForm);

// Form actions
router.post('/:id/publish', togglePublishForm);
router.post('/:id/duplicate', duplicateForm);

// Form responses
router.get('/:id/responses', getFormResponses);

export default router;