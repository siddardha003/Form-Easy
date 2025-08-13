import File from '../models/File.js';
import fs from 'fs';
import path from 'path';
import { formatFileSize } from '../utils/helpers.js';

// @desc    Upload image file
// @route   POST /api/upload/image
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE_UPLOADED',
          message: 'No file was uploaded'
        }
      });
    }

    const { usageType = 'general' } = req.body;
    
    // Validate usage type
    const validUsageTypes = ['form-header', 'question-image', 'user-avatar'];
    if (!validUsageTypes.includes(usageType)) {
      // Clean up uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error cleaning up file:', err);
      });
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USAGE_TYPE',
          message: 'Invalid usage type. Must be one of: ' + validUsageTypes.join(', ')
        }
      });
    }

    // Generate file URL
    const fileUrl = `/uploads/${usageType}/${req.file.filename}`;

    // Get image dimensions (optional - would require image processing library like sharp)
    // For now, we'll skip this and set dimensions to null
    const dimensions = {
      width: null,
      height: null
    };

    // Save file metadata to database
    const fileRecord = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: fileUrl,
      uploadedBy: req.user._id,
      usageType: usageType,
      dimensions: dimensions
    });

    res.status(201).json({
      success: true,
      data: {
        file: {
          id: fileRecord._id,
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          url: fileRecord.url,
          size: fileRecord.size,
          sizeFormatted: formatFileSize(fileRecord.size),
          mimetype: fileRecord.mimetype,
          usageType: fileRecord.usageType,
          dimensions: fileRecord.dimensions,
          uploadedAt: fileRecord.createdAt
        }
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload image error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error cleaning up file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Error uploading file'
      }
    });
  }
};

// @desc    Get user's uploaded files
// @route   GET /api/upload/files
// @access  Private
export const getUserFiles = async (req, res) => {
  try {
    const { usageType, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = { uploadedBy: req.user._id, isActive: true };
    
    if (usageType) {
      query.usageType = usageType;
    }
    
    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    // Get files
    const [files, total] = await Promise.all([
      File.find(query)
        .select('filename originalName url size mimetype usageType dimensions createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      File.countDocuments(query)
    ]);
    
    // Format files for response
    const formattedFiles = files.map(file => ({
      id: file._id,
      filename: file.filename,
      originalName: file.originalName,
      url: file.url,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      mimetype: file.mimetype,
      usageType: file.usageType,
      dimensions: file.dimensions,
      uploadedAt: file.createdAt
    }));
    
    const totalPages = Math.ceil(total / limitNum);
    
    res.json({
      success: true,
      data: {
        files: formattedFiles,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_FILES_ERROR',
        message: 'Error fetching files'
      }
    });
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/files/:id
// @access  Private
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await File.findById(id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found'
        }
      });
    }
    
    // Check ownership
    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only delete your own files.'
        }
      });
    }
    
    // Check if file is being used
    if (file.usedIn && file.usedIn.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_IN_USE',
          message: 'Cannot delete file that is currently being used in forms'
        }
      });
    }
    
    // Delete physical file
    if (fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting physical file:', err);
      });
    }
    
    // Delete file record
    await File.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FILE_ERROR',
        message: 'Error deleting file'
      }
    });
  }
};

// @desc    Serve uploaded file
// @route   GET /api/upload/serve/:id
// @access  Public (but could be made private if needed)
export const serveFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await File.findById(id);
    
    if (!file || !file.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found'
        }
      });
    }
    
    // Check if physical file exists
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PHYSICAL_FILE_NOT_FOUND',
          message: 'Physical file not found'
        }
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Stream the file
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVE_FILE_ERROR',
        message: 'Error serving file'
      }
    });
  }
};

// @desc    Mark file as used in a form/entity
// @route   POST /api/upload/files/:id/mark-used
// @access  Private
export const markFileAsUsed = async (req, res) => {
  try {
    const { id } = req.params;
    const { entityId } = req.body;
    
    if (!entityId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ENTITY_ID_REQUIRED',
          message: 'Entity ID is required'
        }
      });
    }
    
    const file = await File.findById(id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found'
        }
      });
    }
    
    // Check ownership
    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only modify your own files.'
        }
      });
    }
    
    // Mark as used
    await file.markAsUsed(entityId);
    
    res.json({
      success: true,
      message: 'File marked as used successfully'
    });
  } catch (error) {
    console.error('Mark file as used error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MARK_USED_ERROR',
        message: 'Error marking file as used'
      }
    });
  }
};