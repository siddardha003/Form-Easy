import Response from '../models/Response.js';
import Form from '../models/Form.js';
import { getClientIP, paginate, createPaginationMeta } from '../utils/helpers.js';

// @desc    Submit form response
// @route   POST /api/responses
// @access  Private (requires authentication)
export const submitResponse = async (req, res) => {
  try {
    const { formId, answers, startedAt, totalTimeSpent } = req.body;
    const user = req.user; // Now required from authentication

    console.log(`📝 Response submission for form ${formId} by user ${user.email}`);
    console.log('📤 Received answers:', JSON.stringify(answers, null, 2));

    // Get form to validate
    const form = await Form.findById(formId);
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
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORM_NOT_PUBLISHED',
          message: 'This form is not accepting responses'
        }
      });
    }

    // Check for multiple submissions based on form settings
    const existingResponse = await Response.findOne({
      formId,
      userId: user._id
    });

    if (existingResponse && !form.settings.allowMultipleSubmissions) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MULTIPLE_SUBMISSIONS_NOT_ALLOWED',
          message: 'You have already submitted a response to this form'
        }
      });
    }

    // Validate answers against form questions
    const formQuestions = form.questions;
    const processedAnswers = [];
    const requiredQuestions = formQuestions.filter(q => q.required);

    // Check if all required questions are answered
    for (const requiredQuestion of requiredQuestions) {
      const answer = answers.find(a => a.questionId === requiredQuestion.id);
      
      console.log(`🔍 Checking required question: ${requiredQuestion.id} (${requiredQuestion.type})`);
      console.log(`📝 Found answer:`, answer);
      
      if (!answer) {
        console.log(`❌ Missing answer for required question: ${requiredQuestion.id}`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'REQUIRED_QUESTION_MISSING',
            message: `Answer required for question: ${requiredQuestion.title}`
          }
        });
      }
      
      // Validate based on question type
      let isAnswered = false;
      console.log(`🔍 Validating ${requiredQuestion.type} question, answer:`, answer.answer);
      
      switch (requiredQuestion.type) {
        case 'mcq':
          isAnswered = answer.answer && typeof answer.answer === 'string' && answer.answer.trim() !== '';
          break;
        case 'mca':
          isAnswered = Array.isArray(answer.answer) && answer.answer.length > 0;
          break;
        case 'cloze':
          isAnswered = answer.answer && typeof answer.answer === 'object' && Object.keys(answer.answer).length > 0;
          console.log(`🔍 Cloze validation: isObject=${typeof answer.answer === 'object'}, hasKeys=${Object.keys(answer.answer || {}).length > 0}`);
          break;
        case 'categorize':
          isAnswered = answer.answer && typeof answer.answer === 'object' && Object.keys(answer.answer).length > 0;
          console.log(`🔍 Categorize validation: isObject=${typeof answer.answer === 'object'}, hasKeys=${Object.keys(answer.answer || {}).length > 0}`);
          break;
        case 'comprehension':
          isAnswered = answer.answer && typeof answer.answer === 'object' && Object.keys(answer.answer).length > 0;
          break;
        default:
          isAnswered = answer.answer && answer.answer.toString().trim() !== '';
      }
      
      console.log(`✅ Question ${requiredQuestion.id} answered: ${isAnswered}`);
      
      if (!isAnswered) {
        console.log(`❌ Required question not properly answered: ${requiredQuestion.id}`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'REQUIRED_QUESTION_MISSING',
            message: `Answer required for question: ${requiredQuestion.title}`
          }
        });
      }
    }

    // Process and validate each answer
    for (const answer of answers) {
      const question = formQuestions.find(q => q.id === answer.questionId);
      
      if (!question) {
        continue; // Skip answers for non-existent questions
      }

      // Validate answer format based on question type
      let isValidAnswer = true;
      let processedAnswer = answer.answer;

      switch (question.type) {
        case 'mcq':
          // Answer should be a string (selected option ID)
          if (typeof answer.answer !== 'string' || !answer.answer) {
            isValidAnswer = false;
          }
          break;

        case 'mca':
          // Answer should be an array of selected option IDs
          if (!Array.isArray(answer.answer) || answer.answer.length === 0) {
            isValidAnswer = false;
          }
          break;

        case 'categorize':
          // Answer should be an object mapping item IDs to category IDs
          if (typeof answer.answer !== 'object' || answer.answer === null) {
            isValidAnswer = false;
          } else {
            // Validate that all items are categorized
            const itemIds = question.config.items.map(item => item.id);
            const answeredItems = Object.keys(answer.answer);
            
            // Check if answer contains valid item IDs and category IDs
            const validCategoryIds = question.config.categories.map(cat => cat.id);
            for (const [itemId, categoryId] of Object.entries(answer.answer)) {
              if (!itemIds.includes(itemId) || !validCategoryIds.includes(categoryId)) {
                isValidAnswer = false;
                break;
              }
            }
          }
          break;

        case 'cloze':
          // Answer should be an object with blank responses (blank-0, blank-1, etc.)
          if (typeof answer.answer !== 'object' || answer.answer === null) {
            isValidAnswer = false;
          } else {
            // Validate that we have responses for the expected number of blanks
            const text = question.config.text || '';
            const blanks = text.match(/\{\{[^}]+\}\}/g) || [];
            const expectedBlanks = blanks.length;
            const answeredBlanks = Object.keys(answer.answer).filter(key => 
              key.startsWith('blank-') && answer.answer[key] && answer.answer[key].trim() !== ''
            ).length;
            
            // For required questions, all blanks must be filled
            if (question.required && answeredBlanks < expectedBlanks) {
              isValidAnswer = false;
            }
          }
          break;

        case 'comprehension':
          // Answer should be an object with sub-question responses
          if (typeof answer.answer !== 'object' || answer.answer === null) {
            isValidAnswer = false;
          } else {
            // Validate sub-question answers
            const subQuestions = question.config.subQuestions || [];
            for (const subQ of subQuestions) {
              if (subQ.required && (!answer.answer[subQ.id] || 
                  (Array.isArray(answer.answer[subQ.id]) && answer.answer[subQ.id].length === 0) ||
                  (typeof answer.answer[subQ.id] === 'string' && answer.answer[subQ.id].trim() === ''))) {
                isValidAnswer = false;
                break;
              }
            }
          }
          break;

        case 'image':
          // Answer can be text or file reference
          if (!answer.answer || (typeof answer.answer !== 'string' && typeof answer.answer !== 'object')) {
            isValidAnswer = false;
          }
          break;

        default:
          isValidAnswer = false;
      }

      if (!isValidAnswer) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ANSWER_FORMAT',
            message: `Invalid answer format for question: ${question.title}`
          }
        });
      }

      // Calculate score if scoring is enabled
      let score = null;
      let maxScore = null;

      if (question.scoring && question.scoring.enabled) {
        maxScore = question.scoring.points || 1;
        score = calculateQuestionScore(question, processedAnswer, maxScore);
      }

      processedAnswers.push({
        questionId: answer.questionId,
        questionType: question.type,
        answer: processedAnswer,
        timeSpent: answer.timeSpent || 0,
        score,
        maxScore
      });
    }

    // Calculate completion percentage
    const totalQuestions = formQuestions.length;
    const answeredQuestions = processedAnswers.length;
    const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

    // Create response with user information
    const response = await Response.create({
      formId,
      userId: user._id,
      respondentEmail: user.email,
      respondentName: `${user.firstName} ${user.lastName}`,
      answers: processedAnswers,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      totalTimeSpent: totalTimeSpent || 0,
      completionPercentage,
      isComplete: completionPercentage === 100,
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent') || null
    });

    console.log(`✅ Response created with ID: ${response._id} for user: ${user.email}`);

    // Update form analytics
    const avgCompletionTime = totalTimeSpent || 0;
    await form.incrementSubmissions(avgCompletionTime);

    res.status(201).json({
      success: true,
      data: {
        responseId: response._id,
        message: form.settings.submissionMessage
      },
      message: 'Response submitted successfully'
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMIT_RESPONSE_ERROR',
        message: 'Error submitting response'
      }
    });
  }
};

// @desc    Get responses for a form
// @route   GET /api/forms/:formId/responses
// @access  Private (form owner only)
export const getFormResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    const { page = 1, limit = 10, startDate, endDate, email } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    // Check if form exists and user owns it
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FORM_NOT_FOUND',
          message: 'Form not found'
        }
      });
    }

    if (form.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only view responses for your own forms.'
        }
      });
    }

    // Build query
    const query = { formId };

    // Add date filters
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }

    // Add email filter
    if (email) {
      query.respondentEmail = { $regex: email, $options: 'i' };
    }

    // Get responses with pagination
    const [responses, total] = await Promise.all([
      Response.find(query)
        .select('respondentEmail respondentName submittedAt totalTimeSpent isComplete completionPercentage totalScore scorePercentage')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Response.countDocuments(query)
    ]);

    const pagination = createPaginationMeta(total, pageNum, limitNum);

    // Calculate summary statistics
    const stats = await Response.aggregate([
      { $match: { formId: form._id } },
      {
        $group: {
          _id: null,
          totalResponses: { $sum: 1 },
          averageCompletionTime: { $avg: '$totalTimeSpent' },
          averageScore: { $avg: '$totalScore' },
          completionRate: { $avg: { $cond: ['$isComplete', 1, 0] } }
        }
      }
    ]);

    const summary = stats[0] || {
      totalResponses: 0,
      averageCompletionTime: 0,
      averageScore: 0,
      completionRate: 0
    };

    res.json({
      success: true,
      data: {
        responses,
        pagination,
        summary: {
          ...summary,
          averageCompletionTime: Math.round(summary.averageCompletionTime || 0),
          completionRate: Math.round((summary.completionRate || 0) * 100)
        }
      }
    });
  } catch (error) {
    console.error('Get form responses error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_RESPONSES_ERROR',
        message: 'Error fetching responses'
      }
    });
  }
};

// @desc    Get single response
// @route   GET /api/responses/:id
// @access  Private (form owner only)
export const getResponse = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await Response.findById(id).populate('formId', 'title createdBy');

    if (!response) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESPONSE_NOT_FOUND',
          message: 'Response not found'
        }
      });
    }

    // Check if user owns the form
    if (response.formId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only view responses for your own forms.'
        }
      });
    }

    res.json({
      success: true,
      data: {
        response
      }
    });
  } catch (error) {
    console.error('Get response error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_RESPONSE_ERROR',
        message: 'Error fetching response'
      }
    });
  }
};

// @desc    Delete response
// @route   DELETE /api/responses/:id
// @access  Private (form owner only)
export const deleteResponse = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await Response.findById(id).populate('formId', 'createdBy');

    if (!response) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESPONSE_NOT_FOUND',
          message: 'Response not found'
        }
      });
    }

    // Check if user owns the form
    if (response.formId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only delete responses for your own forms.'
        }
      });
    }

    await Response.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_RESPONSE_ERROR',
        message: 'Error deleting response'
      }
    });
  }
};

// Helper function to calculate question score
function calculateQuestionScore(question, answer, maxScore) {
  switch (question.type) {
    case 'categorize':
      if (!question.config.items.some(item => item.correctCategory)) {
        return maxScore; // No correct answers defined, give full points
      }
      
      let correctCount = 0;
      let totalItems = 0;
      
      for (const item of question.config.items) {
        if (item.correctCategory) {
          totalItems++;
          if (answer[item.id] === item.correctCategory) {
            correctCount++;
          }
        }
      }
      
      return totalItems > 0 ? Math.round((correctCount / totalItems) * maxScore) : 0;

    case 'cloze':
      let correctBlanks = 0;
      const totalBlanks = question.config.blanks.length;
      
      for (let i = 0; i < totalBlanks; i++) {
        const blank = question.config.blanks[i];
        const userAnswer = answer[i];
        
        if (blank.correctAnswers && userAnswer) {
          const isCorrect = blank.correctAnswers.some(correctAnswer => {
            return blank.caseSensitive 
              ? correctAnswer === userAnswer
              : correctAnswer.toLowerCase() === userAnswer.toLowerCase();
          });
          
          if (isCorrect) correctBlanks++;
        }
      }
      
      return totalBlanks > 0 ? Math.round((correctBlanks / totalBlanks) * maxScore) : 0;

    case 'comprehension':
      let correctSubQuestions = 0;
      let totalSubQuestions = 0;
      
      for (const subQ of question.config.subQuestions) {
        if (subQ.correctAnswer) {
          totalSubQuestions++;
          const userAnswer = answer[subQ.id];
          
          if (userAnswer === subQ.correctAnswer) {
            correctSubQuestions++;
          }
        }
      }
      
      return totalSubQuestions > 0 ? Math.round((correctSubQuestions / totalSubQuestions) * maxScore) : maxScore;

    default:
      return 0;
  }
}