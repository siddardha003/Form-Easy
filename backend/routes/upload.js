import express from 'express';
import {
  uploadImage,
  getUserFiles,
  deleteFile,
  serveFile,
  markFileAsUsed
} from '../controllers/uploadController.js';
import { uploadSingle, validateFileUpload, cleanupOnError } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public route for serving files
router.get('/serve/:id', serveFile);

// Protected routes
router.use(authenticate);

// File upload
router.post('/image', 
  cleanupOnError,
  uploadSingle('image'),
  validateFileUpload,
  uploadImage
);

// File management
router.get('/files', getUserFiles);
router.delete('/files/:id', deleteFile);
router.post('/files/:id/mark-used', markFileAsUsed);

export default router;