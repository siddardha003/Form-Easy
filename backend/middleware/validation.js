import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().reduce((acc, error) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errorMessages
      }
    });
  }
  
  next();
};

// User registration validation
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  handleValidationErrors
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Form validation
export const validateForm = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Form title is required and must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Form description must be less than 500 characters'),
  body('questions')
    .isArray()
    .withMessage('Questions must be an array'),
  body('questions.*.title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Question title is required and must be less than 200 characters'),
  body('questions.*.type')
    .isIn(['categorize', 'cloze', 'comprehension'])
    .withMessage('Question type must be categorize, cloze, or comprehension'),
  handleValidationErrors
];

// Response validation
export const validateResponse = [
  body('formId')
    .isMongoId()
    .withMessage('Valid form ID is required'),
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*.questionId')
    .notEmpty()
    .withMessage('Question ID is required for each answer'),
  body('answers.*.questionType')
    .isIn(['categorize', 'cloze', 'comprehension'])
    .withMessage('Question type must be categorize, cloze, or comprehension'),
  handleValidationErrors
];

// Google OAuth validation
export const validateGoogleAuth = [
  body('token')
    .notEmpty()
    .withMessage('Google token is required'),
  handleValidationErrors
];