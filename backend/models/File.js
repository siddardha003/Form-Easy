import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true,
    validate: {
      validator: function(mimetype) {
        // Only allow image files
        return mimetype.startsWith('image/');
      },
      message: 'Only image files are allowed'
    }
  },
  size: {
    type: Number,
    required: true,
    max: [5242880, 'File size cannot exceed 5MB'] // 5MB limit
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // File usage tracking
  usageType: {
    type: String,
    enum: ['form-header', 'question-image', 'user-avatar'],
    required: true
  },
  usedIn: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'usageType === "user-avatar" ? "User" : "Form"'
  }],
  // File metadata
  dimensions: {
    width: Number,
    height: Number
  },
  // File status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
fileSchema.index({ uploadedBy: 1, createdAt: -1 });
fileSchema.index({ usageType: 1 });
fileSchema.index({ filename: 1 });

// Virtual for file URL (in case we need to modify the URL structure)
fileSchema.virtual('publicUrl').get(function() {
  return this.url;
});

// Method to mark file as used
fileSchema.methods.markAsUsed = function(entityId) {
  if (!this.usedIn.includes(entityId)) {
    this.usedIn.push(entityId);
  }
  return this.save();
};

// Method to remove usage
fileSchema.methods.removeUsage = function(entityId) {
  this.usedIn = this.usedIn.filter(id => !id.equals(entityId));
  return this.save();
};

// Static method to cleanup unused files
fileSchema.statics.cleanupUnusedFiles = async function() {
  const unusedFiles = await this.find({
    usedIn: { $size: 0 },
    createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
  });
  
  // Here you would also delete the actual files from storage
  return await this.deleteMany({
    _id: { $in: unusedFiles.map(file => file._id) }
  });
};

const File = mongoose.model('File', fileSchema);

export default File;