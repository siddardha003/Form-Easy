import Form from '../models/Form.js';
import { generateUniqueId, validateQuestionConfig, paginate, createPaginationMeta } from '../utils/helpers.js';

// @desc    Get all forms for authenticated user
// @route   GET /api/forms
// @access  Private
export const getForms = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    // Build query
    const query = { createdBy: req.user._id };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status === 'published') {
      query['settings.isPublished'] = true;
    } else if (status === 'draft') {
      query['settings.isPublished'] = false;
    }

    // Get forms with pagination
    const [forms, total] = await Promise.all([
      Form.find(query)
        .select('title description headerImage settings analytics createdAt updatedAt publishedAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Form.countDocuments(query)
    ]);

    const pagination = createPaginationMeta(total, pageNum, limitNum);

    res.json({
      success: true,
      data: {
        forms,
        pagination
      }
    });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_FORMS_ERROR',
        message: 'Error fetching forms'
      }
    });
  }
};

// @desc    Get single form
// @route   GET /api/forms/:id
// @access  Private (owner) or Public (if published)
export const getForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { preview } = req.query;

    const form = await Form.findById(id).populate('createdBy', 'firstName lastName email');

    if (!form) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FORM_NOT_FOUND',
          message: 'Form not found'
        }
      });
    }

    // Check permissions
    const isOwner = req.user && form.createdBy._id.toString() === req.user._id.toString();
    const isPublished = form.settings.isPublished;

    if (!isOwner && !isPublished) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to this form'
        }
      });
    }

    // Increment view count for published forms (not for owner previews)
    if (isPublished && !isOwner && preview !== 'true') {
      await form.incrementViews();
    }

    // Return appropriate data based on access level
    const responseData = isOwner ? form : form.getPublicData();

    res.json({
      success: true,
      data: {
        form: responseData
      }
    });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_FORM_ERROR',
        message: 'Error fetching form'
      }
    });
  }
};

// @desc    Create new form
// @route   POST /api/forms
// @access  Private
export const createForm = async (req, res) => {
  try {
    const { title, description, headerImage, questions = [], settings = {} } = req.body;
    console.log(`📝 Creating form: ${title}, Questions: ${questions.length}`);

    // Process questions and assign unique IDs
    const processedQuestions = questions.map((question, index) => {
      console.log(`  - Question ${index + 1}: Type ${question.type}`);
      // Validate question configuration
      if (!validateQuestionConfig(question.type, question.config)) {
        throw new Error(`Invalid configuration for question ${index + 1} of type ${question.type}`);
      }

      return {
        ...question,
        id: question.id || generateUniqueId('q'),
        order: question.order !== undefined ? question.order : index
      };
    });

    // Create form
    const form = await Form.create({
      title,
      description,
      headerImage,
      questions: processedQuestions,
      settings: {
        isPublished: false,
        allowAnonymous: true,
        collectEmail: false,
        showProgressBar: true,
        allowMultipleSubmissions: false,
        submissionMessage: 'Thank you for your submission!',
        ...settings
      },
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: {
        form
      },
      message: 'Form created successfully'
    });
  } catch (error) {
    console.error('Create form error:', error);
    
    if (error.message.includes('Invalid configuration')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUESTION_CONFIG',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_FORM_ERROR',
        message: 'Error creating form'
      }
    });
  }
};

// @desc    Update form
// @route   PUT /api/forms/:id
// @access  Private (owner only)
export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, headerImage, questions, settings } = req.body;

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

    // Check ownership
    if (form.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only update your own forms.'
        }
      });
    }

    // Process questions if provided
    let processedQuestions = form.questions;
    if (questions) {
      processedQuestions = questions.map((question, index) => {
        // Validate question configuration
        if (!validateQuestionConfig(question.type, question.config)) {
          throw new Error(`Invalid configuration for question ${index + 1} of type ${question.type}`);
        }

        return {
          ...question,
          id: question.id || generateUniqueId('q'),
          order: question.order !== undefined ? question.order : index
        };
      });
    }

    // Process headerImage - extract URL if it's an object
    let processedHeaderImage = headerImage;
    if (headerImage && typeof headerImage === 'object') {
      processedHeaderImage = headerImage.secure_url || headerImage.url;
    }

    // Update form
    const updatedForm = await Form.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(headerImage !== undefined && { headerImage: processedHeaderImage }),
        ...(questions && { questions: processedQuestions }),
        ...(settings && { settings: { ...form.settings, ...settings } })
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: {
        form: updatedForm
      },
      message: 'Form updated successfully'
    });
  } catch (error) {
    console.error('Update form error:', error);
    
    if (error.message.includes('Invalid configuration')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUESTION_CONFIG',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FORM_ERROR',
        message: 'Error updating form'
      }
    });
  }
};

// @desc    Delete form
// @route   DELETE /api/forms/:id
// @access  Private (owner only)
export const deleteForm = async (req, res) => {
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

    // Check ownership
    if (form.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only delete your own forms.'
        }
      });
    }

    await Form.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FORM_ERROR',
        message: 'Error deleting form'
      }
    });
  }
};

// @desc    Publish/unpublish form
// @route   POST /api/forms/:id/publish
// @access  Private (owner only)
export const togglePublishForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

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

    // Check ownership
    if (form.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only publish your own forms.'
        }
      });
    }

    // Validate form has questions before publishing
    if (isPublished && (!form.questions || form.questions.length === 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_PUBLISH_EMPTY_FORM',
          message: 'Cannot publish form without questions'
        }
      });
    }

    // Update publish status
    form.settings.isPublished = isPublished;
    if (isPublished && !form.publishedAt) {
      form.publishedAt = new Date();
    }

    await form.save();

    res.json({
      success: true,
      data: {
        form
      },
      message: `Form ${isPublished ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    console.error('Toggle publish form error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PUBLISH_FORM_ERROR',
        message: 'Error updating form publish status'
      }
    });
  }
};

// @desc    Duplicate form
// @route   POST /api/forms/:id/duplicate
// @access  Private (owner only)
export const duplicateForm = async (req, res) => {
  try {
    const { id } = req.params;

    const originalForm = await Form.findById(id);

    if (!originalForm) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FORM_NOT_FOUND',
          message: 'Form not found'
        }
      });
    }

    // Check ownership
    if (originalForm.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only duplicate your own forms.'
        }
      });
    }

    // Create duplicate with new IDs
    const duplicatedQuestions = originalForm.questions.map(question => ({
      ...question.toObject(),
      id: generateUniqueId('q')
    }));

    const duplicatedForm = await Form.create({
      title: `${originalForm.title} (Copy)`,
      description: originalForm.description,
      headerImage: originalForm.headerImage,
      questions: duplicatedQuestions,
      settings: {
        ...originalForm.settings.toObject(),
        isPublished: false // Always create as draft
      },
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: {
        form: duplicatedForm
      },
      message: 'Form duplicated successfully'
    });
  } catch (error) {
    console.error('Duplicate form error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DUPLICATE_FORM_ERROR',
        message: 'Error duplicating form'
      }
    });
  }
};