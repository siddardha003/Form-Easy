# Form Builder Backend API

Backend API for the custom form builder application built with Express.js, MongoDB, and Node.js.

## Features

- User authentication (manual and Google OAuth)
- Form creation and management
- Three question types: Categorize, Cloze, Comprehension
- Response collection and analytics
- File upload for images
- RESTful API design
- Input validation and error handling
- Security middleware

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set a secure JWT_SECRET
   - Configure MongoDB connection string
   - Add Google OAuth credentials (when ready)

4. Make sure MongoDB is running locally or update MONGODB_URI for Atlas

## Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Authentication (Coming Next)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Forms (Coming Next)
- `GET /api/forms` - Get user's forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:id` - Get specific form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Responses (Coming Next)
- `POST /api/responses` - Submit form response
- `GET /api/forms/:id/responses` - Get form responses

### File Upload (Coming Next)
- `POST /api/upload/image` - Upload image

## Database Models

### User
- Email, password, name
- Google OAuth support
- User preferences

### Form
- Title, description, questions
- Settings and analytics
- Question configurations for each type

### Response
- Form responses with answers
- Timing and completion data
- Scoring support

### File
- Image upload metadata
- Usage tracking

## Question Types

### Categorize
Items that can be dragged into categories

### Cloze
Fill-in-the-blank questions with text passages

### Comprehension
Reading passages with multiple sub-questions

## Security Features

- Helmet for security headers
- Rate limiting
- CORS configuration
- Input validation
- JWT authentication
- Password hashing with bcrypt

## Error Handling

Centralized error handling with consistent response format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message"
  }
}
```

## Testing

Run tests:
```bash
npm test
```

## Production Deployment

1. Set NODE_ENV=production
2. Use MongoDB Atlas for database
3. Configure proper JWT_SECRET
4. Set up file storage (local or cloud)
5. Configure CORS for production frontend URL

## Testing

Run the comprehensive test suite:
```bash
node test-all.js
```

Individual test files:
- `node test-auth.js` - Authentication endpoints
- `node test-forms.js` - Form management endpoints  
- `node test-responses.js` - Response collection endpoints
- `node test-upload.js` - File upload endpoints

## Current Status

✅ **Completed Features:**
- User authentication (manual registration/login)
- JWT token-based security
- Form CRUD operations
- Form publishing and public access
- Response collection and validation
- File upload system for images
- All three question types (Categorize, Cloze, Comprehension)
- Comprehensive error handling
- Input validation and security

🔄 **Next Steps:**
1. Add Google OAuth integration (credentials needed)
2. Integrate with frontend application
3. Add email notifications (optional)
4. Performance optimization
5. Production deployment setup