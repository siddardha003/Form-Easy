import mongoose from 'mongoose';

// Answer schema for different question types
const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    required: true,
    enum: ['categorize', 'cloze', 'comprehension']
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(answer) {
        // Validate answer structure based on question type
        switch (this.questionType) {
          case 'categorize':
            // Answer should be an object mapping item IDs to category IDs
            return typeof answer === 'object' && answer !== null;
          case 'cloze':
            // Answer should be an array of blank responses
            return Array.isArray(answer);
          case 'comprehension':
            // Answer should be an object with sub-question responses
            return typeof answer === 'object' && answer !== null;
          default:
            return false;
        }
      },
      message: 'Invalid answer format for question type'
    }
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: 0 // Time spent on this question in seconds
  },
  // For scoring (optional)
  score: {
    type: Number,
    default: null,
    min: 0
  },
  maxScore: {
    type: Number,
    default: null,
    min: 0
  }
}, { _id: false });

const responseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  // Respondent information
  respondentEmail: {
    type: String,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ],
    default: null
  },
  respondentName: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    default: null
  },
  // Response data
  answers: [answerSchema],
  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    required: true
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0 // Total time spent on form in seconds
  },
  // Technical metadata
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  // Form completion status
  isComplete: {
    type: Boolean,
    default: true
  },
  completionPercentage: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  // Scoring (if enabled)
  totalScore: {
    type: Number,
    default: null,
    min: 0
  },
  maxTotalScore: {
    type: Number,
    default: null,
    min: 0
  },
  scorePercentage: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for response duration
responseSchema.virtual('duration').get(function() {
  if (this.startedAt && this.submittedAt) {
    return Math.round((this.submittedAt - this.startedAt) / 1000); // in seconds
  }
  return this.totalTimeSpent;
});

// Indexes for performance
responseSchema.index({ formId: 1, submittedAt: -1 });
responseSchema.index({ respondentEmail: 1 });
responseSchema.index({ submittedAt: -1 });

// Pre-save middleware to calculate totals
responseSchema.pre('save', function(next) {
  // Calculate total time spent if not set
  if (this.totalTimeSpent === 0 && this.answers.length > 0) {
    this.totalTimeSpent = this.answers.reduce((total, answer) => total + (answer.timeSpent || 0), 0);
  }

  // Calculate total score if scoring is enabled
  const scoredAnswers = this.answers.filter(answer => answer.score !== null);
  if (scoredAnswers.length > 0) {
    this.totalScore = scoredAnswers.reduce((total, answer) => total + (answer.score || 0), 0);
    this.maxTotalScore = scoredAnswers.reduce((total, answer) => total + (answer.maxScore || 0), 0);
    
    if (this.maxTotalScore > 0) {
      this.scorePercentage = Math.round((this.totalScore / this.maxTotalScore) * 100);
    }
  }

  // Calculate completion percentage
  if (this.answers.length > 0) {
    // This would need to be calculated based on the form's total questions
    // For now, we'll assume it's set externally
  }

  next();
});

// Method to get answer by question ID
responseSchema.methods.getAnswerByQuestionId = function(questionId) {
  return this.answers.find(answer => answer.questionId === questionId);
};

// Method to add or update answer
responseSchema.methods.setAnswer = function(questionId, questionType, answerData, timeSpent = 0) {
  const existingAnswerIndex = this.answers.findIndex(answer => answer.questionId === questionId);
  
  const answerObj = {
    questionId,
    questionType,
    answer: answerData,
    timeSpent
  };

  if (existingAnswerIndex >= 0) {
    this.answers[existingAnswerIndex] = answerObj;
  } else {
    this.answers.push(answerObj);
  }
};

// Method to get summary statistics
responseSchema.methods.getSummary = function() {
  return {
    id: this._id,
    formId: this.formId,
    respondentEmail: this.respondentEmail,
    respondentName: this.respondentName,
    submittedAt: this.submittedAt,
    duration: this.duration,
    totalTimeSpent: this.totalTimeSpent,
    isComplete: this.isComplete,
    completionPercentage: this.completionPercentage,
    totalAnswers: this.answers.length,
    totalScore: this.totalScore,
    maxTotalScore: this.maxTotalScore,
    scorePercentage: this.scorePercentage
  };
};

const Response = mongoose.model('Response', responseSchema);

export default Response;