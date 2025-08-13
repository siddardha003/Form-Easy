import express from 'express';
import Form from '../models/Form.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get public form (for form filling) - Now requires authentication
// @route   GET /api/public/forms/:id
// @access  Private (requires authentication)
router.get('/forms/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Form request for ID: ${id} by user: ${req.user.email}`);

    const form = await Form.findById(id);

    if (!form) {
      console.log(`❌ Form not found for ID: ${id}`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'FORM_NOT_FOUND',
          message: 'Form not found'
        }
      });
    }

    console.log(`✅ Form found: ${form.title}, Published: ${form.settings.isPublished}`);

    // Only allow access to published forms (no anonymous access)
    if (!form.settings.isPublished) {
      console.log(`🔒 Form not published`);
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORM_NOT_PUBLISHED',
          message: 'This form is not published'
        }
      });
    }

    // Increment view count for authenticated access
    await form.incrementViews();
    console.log(`📊 View count incremented for form: ${form.title} by user: ${req.user.email}`);

    // Return form data with user context
    res.json({
      success: true,
      data: {
        form: form.getPublicData(),
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name
        }
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