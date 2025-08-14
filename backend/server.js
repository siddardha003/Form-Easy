// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import formRoutes from './routes/forms.js';
import publicRoutes from './routes/public.js';
import responseRoutes from './routes/responses.js';
import uploadRoutes from './routes/upload.js';
import imageUploadRoutes from './routes/imageUpload.js';

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.originalUrl}`);
  next();
});

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Form Builder API is running',
    timestamp: new Date().toISOString(),
    routes: {
      auth: !!authRoutes,
      forms: !!formRoutes,
      public: !!publicRoutes
    }
  });
});

// Debug endpoint to list all routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

// Debug: Log all registered routes
console.log('🔧 Registering routes...');

// API Routes
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered');

app.use('/api/forms', formRoutes);
console.log('✅ Form routes registered');

app.use('/api/public', publicRoutes);
console.log('✅ Public routes registered');

app.use('/api/responses', responseRoutes);
console.log('✅ Response routes registered');

app.use('/api/upload', uploadRoutes);
console.log('✅ Upload routes registered');

app.use('/api/images', imageUploadRoutes);
console.log('✅ Image routes registered');

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});