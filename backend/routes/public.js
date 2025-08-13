import express from 'express';
import Form from '../models/Form.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get public form (for form filling)
// @route   GET /api/public/forms/:id
// @access  Public
router.get('/forms/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FORM_NOT_FOUND',
          message: 'Form not found'
        }
      });
    }

    // Check if form is published
    if (!form.settings.isPublished) {
      // Only allow owner to view unpublished forms
      if (!req.user || form.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORM_NOT_PUBLISHED',
            message: 'This form is not published'
          }
        });
      }
    }

    // Increment view count (only for non-owners)
    if (!req.user || form.createdBy.toString() !== req.user._id.toString()) {
      await form.incrementViews();
    }

    // Return public form data
    res.json({
      success: true,
      data: {
        form: form.getPublicData()
      }
    });
  } catch (error) {
    console.error('Get public form error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_FORM_ERROR',
        message: 'Error fetching form'
      }
    });
  }
});

export default router;