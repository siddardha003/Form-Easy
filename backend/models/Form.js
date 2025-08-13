import mongoose from 'mongoose';

// Question schema for different question types
const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['mcq', 'mca', 'categorize', 'cloze', 'comprehension', 'image']
  },
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    maxlength: [200, 'Question title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Question description cannot exceed 1000 characters']
  },
  image: {
    type: String,
    default: null
  },
  required: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true
  },
  // Configuration specific to question type
  config: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(config) {
        // Validate config based on question type
        switch (this.type) {
          case 'mcq':
          case 'mca':
            return config.options && Array.isArray(config.options) &&
                   config.options.length > 0;
          case 'categorize':
            return config.categories && config.items && 
                   Array.isArray(config.categories) && 
                   Array.isArray(config.items);
          case 'cloze':
            return config.text && config.blanks && 
                   Array.isArray(config.blanks);
          case 'comprehension':
            return config.passage && config.subQuestions && 
                   Array.isArray(config.subQuestions);
          case 'image':
            return config.imageUrl || config.question;
          default:
            return false;
        }
      },
      message: 'Invalid configuration for question type'
    }
  },
  // Scoring configuration (optional)
  scoring: {
    enabled: {
      type: Boolean,
      default: false
    },
    points: {
      type: Number,
      default: 1,
      min: 0
    }
  }
}, { _id: false });

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Form title is required'],
    trim: true,
    maxlength: [100, 'Form title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Form description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  headerImage: {
    type: String,
    default: null
  },
  questions: [questionSchema],
  settings: {
    isPublished: {
      type: Boolean,
      default: false
    },
    allowAnonymous: {
      type: Boolean,
      default: true
    },
    collectEmail: {
      type: Boolean,
      default: false
    },
    showProgressBar: {
      type: Boolean,
      default: true
    },
    allowMultipleSubmissions: {
      type: Boolean,
      default: false
    },
    submissionMessage: {
      type: String,
      default: 'Thank you for your submission!',
      maxlength: [200, 'Submission message cannot exceed 200 characters']
    }
  },
  // Form analytics
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    averageCompletionTime: {
      type: Number,
      default: 0 // in seconds
    }
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for form URL
formSchema.virtual('formUrl').get(function() {
  return `/forms/${this._id}`;
});

// Virtual for completion rate
formSchema.virtual('completionRate').get(function() {
  if (this.analytics.totalViews === 0) return 0;
  return Math.round((this.analytics.totalSubmissions / this.analytics.totalViews) * 100);
});

// Indexes for performance
formSchema.index({ createdBy: 1, createdAt: -1 });
formSchema.index({ 'settings.isPublished': 1 });
formSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware to set publishedAt
formSchema.pre('save', function(next) {
  if (this.isModified('settings.isPublished') && this.settings.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Method to increment views
formSchema.methods.incrementViews = async function() {
  this.analytics.totalViews += 1;
  return await this.save();
};

// Method to increment submissions
formSchema.methods.incrementSubmissions = async function(completionTime = 0) {
  this.analytics.totalSubmissions += 1;
  
  // Update average completion time
  if (completionTime > 0) {
    const totalTime = this.analytics.averageCompletionTime * (this.analytics.totalSubmissions - 1);
    this.analytics.averageCompletionTime = Math.round((totalTime + completionTime) / this.analytics.totalSubmissions);
  }
  
  return await this.save();
};

// Method to get public form data (for form filling)
formSchema.methods.getPublicData = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    headerImage: this.headerImage,
    questions: this.questions.map(q => ({
      id: q.id,
      type: q.type,
      title: q.title,
      description: q.description,
      image: q.image,
      required: q.required,
      order: q.order,
      config: q.config
    })),
    settings: {
      isPublished: this.settings.isPublished,
      showProgressBar: this.settings.showProgressBar,
      submissionMessage: this.settings.submissionMessage
    }
  };
};

const Form = mongoose.model('Form', formSchema);

export default Form;