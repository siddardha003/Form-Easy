import crypto from 'crypto';

// Generate unique ID for questions, forms, etc.
export const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(4).toString('hex');
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Sanitize filename for safe storage
export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

// Generate secure random string
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Calculate time difference in human readable format
export const getTimeDifference = (date1, date2 = new Date()) => {
  const diffInSeconds = Math.abs((date2 - date1) / 1000);
  
  if (diffInSeconds < 60) {
    return `${Math.floor(diffInSeconds)} seconds`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} minutes`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} hours`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} days`;
  }
};

// Validate question configuration based on type
export const validateQuestionConfig = (type, config) => {
  switch (type) {
    case 'mcq':
    case 'mca':
      return (
        config.options &&
        Array.isArray(config.options) &&
        config.options.length > 0 &&
        config.options.every(option => option && typeof option === 'object' && option.text)
      );
    
    case 'categorize':
      return (
        config.categories &&
        Array.isArray(config.categories) &&
        config.categories.length > 0 &&
        config.items &&
        Array.isArray(config.items) &&
        config.items.length > 0
      );
    
    case 'cloze':
      return (
        config.text &&
        typeof config.text === 'string' &&
        config.text.includes('{{') && 
        config.text.includes('}}')
      );
    
    case 'comprehension':
      return (
        config.passage &&
        typeof config.passage === 'string' &&
        config.subQuestions &&
        Array.isArray(config.subQuestions) &&
        config.subQuestions.length > 0
      );
    
    case 'image':
      return (
        config.imageUrl ||
        (config.question && typeof config.question === 'string')
      );
    
    default:
      return false;
  }
};

// Extract client IP address from request
export const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         'unknown';
};

// Paginate results
export const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
  const skip = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

// Create pagination metadata
export const createPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};