# PromptCanvas Pro - System Architecture

## Overview
PromptCanvas Pro is a full-stack web application for AI-powered image generation using the Flux.1-schnell-Free API from Together AI. The application features user authentication, image generation, gallery management, and is deployed entirely on AWS Free Tier.

## Technology Stack

### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS v3
- **Authentication**: Clerk React SDK
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Deployment**: AWS S3 + CloudFront

### Backend
- **Framework**: Flask (Python)
- **Authentication**: Clerk JWT validation
- **AI API**: Together AI Flux.1-schnell-Free
- **Image Processing**: Pillow (PIL)
- **Deployment**: AWS Lambda + API Gateway

### Database & Storage
- **Image Storage**: AWS S3
- **Metadata Storage**: AWS DynamoDB
- **User Sessions**: Clerk managed

### Infrastructure (AWS Free Tier)
- **Static Hosting**: S3 + CloudFront
- **API Hosting**: Lambda + API Gateway
- **Database**: DynamoDB
- **Storage**: S3
- **CDN**: CloudFront

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Flask API      │    │   Together AI   │
│   (S3+CF)       │◄──►│   (Lambda)       │◄──►│   Flux API      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       
         │                       │                       
         ▼                       ▼                       
┌─────────────────┐    ┌──────────────────┐              
│     Clerk       │    │   AWS Services   │              
│  Authentication │    │  S3 + DynamoDB   │              
└─────────────────┘    └──────────────────┘              
```

## Component Architecture

### Frontend Components
```
src/
├── components/
│   ├── auth/
│   │   ├── SignIn.jsx
│   │   ├── SignUp.jsx
│   │   └── UserProfile.jsx
│   ├── image/
│   │   ├── ImageGenerator.jsx
│   │   ├── ImagePreview.jsx
│   │   ├── ImageGallery.jsx
│   │   └── ImageCard.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── LoadingSpinner.jsx
│   └── layout/
│       ├── Header.jsx
│       ├── Sidebar.jsx
│       └── Layout.jsx
├── pages/
│   ├── Home.jsx
│   ├── Generate.jsx
│   ├── Gallery.jsx
│   └── Profile.jsx
├── hooks/
│   ├── useImageGeneration.js
│   ├── useGallery.js
│   └── useAuth.js
├── services/
│   ├── api.js
│   ├── imageService.js
│   └── authService.js
└── utils/
    ├── constants.js
    ├── helpers.js
    └── validation.js
```

### Backend Structure
```
backend/
├── app.py              # Flask application entry point
├── routes/
│   ├── __init__.py
│   ├── auth.py         # Authentication routes
│   ├── images.py       # Image generation routes
│   └── gallery.py      # Gallery management routes
├── services/
│   ├── __init__.py
│   ├── together_ai.py  # Together AI integration
│   ├── s3_service.py   # AWS S3 operations
│   ├── dynamodb.py     # DynamoDB operations
│   └── clerk_auth.py   # Clerk authentication
├── models/
│   ├── __init__.py
│   ├── user.py         # User data models
│   └── image.py        # Image metadata models
├── utils/
│   ├── __init__.py
│   ├── config.py       # Configuration management
│   ├── validators.py   # Input validation
│   └── helpers.py      # Utility functions
├── requirements.txt    # Python dependencies
└── lambda_function.py  # AWS Lambda handler
```

## Data Flow

### Image Generation Flow
1. User enters prompt in React frontend
2. Frontend sends authenticated request to Flask API
3. Flask validates JWT token with Clerk
4. Flask calls Together AI Flux.1-schnell-Free API
5. Generated image is stored in S3
6. Image metadata saved to DynamoDB
7. Image URL returned to frontend
8. Frontend displays generated image

### Gallery Management Flow
1. User requests gallery in React frontend
2. Frontend fetches user's images from Flask API
3. Flask queries DynamoDB for user's image metadata
4. Flask returns image URLs and metadata
5. Frontend displays gallery with S3 image URLs

## Security Architecture

### Authentication
- **Frontend**: Clerk React SDK handles login/logout
- **Backend**: JWT token validation for all protected routes
- **Session Management**: Clerk manages user sessions

### API Security
- **CORS**: Configured for frontend domain only
- **Rate Limiting**: Implemented to prevent abuse
- **Input Validation**: All inputs validated and sanitized
- **Environment Variables**: Sensitive data in environment variables

### AWS Security
- **IAM Roles**: Least privilege access for Lambda
- **S3 Bucket Policy**: Public read for images, authenticated write
- **DynamoDB**: User-scoped access patterns

## Deployment Architecture

### Frontend Deployment (S3 + CloudFront)
1. Build React app with `npm run build`
2. Upload build files to S3 bucket
3. Configure S3 for static website hosting
4. Set up CloudFront distribution for CDN
5. Configure custom domain (optional)

### Backend Deployment (Lambda + API Gateway)
1. Package Flask app with dependencies
2. Deploy to AWS Lambda
3. Configure API Gateway for HTTP endpoints
4. Set up environment variables in Lambda
5. Configure CORS and authentication

### Database Setup
1. Create DynamoDB tables for users and images
2. Configure S3 bucket for image storage
3. Set up IAM roles and policies
4. Configure environment variables

## Environment Configuration

### Frontend Environment Variables
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=https://api.promptcanvaspro.com
VITE_AWS_REGION=us-east-1
```

### Backend Environment Variables
```
CLERK_SECRET_KEY=sk_test_...
TOGETHER_AI_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET_NAME=promptcanvaspro-images
DYNAMODB_TABLE_USERS=promptcanvaspro-users
DYNAMODB_TABLE_IMAGES=promptcanvaspro-images
```

## Performance Considerations

### Frontend Optimization
- Code splitting with React.lazy()
- Image lazy loading
- Caching with React Query
- Optimized bundle size with Vite

### Backend Optimization
- Lambda cold start optimization
- DynamoDB query optimization
- S3 image compression
- API response caching

### Infrastructure Optimization
- CloudFront caching for static assets
- S3 Transfer Acceleration
- DynamoDB auto-scaling
- Lambda provisioned concurrency (if needed)

## Monitoring & Analytics

### Application Monitoring
- AWS CloudWatch for Lambda metrics
- S3 access logs
- DynamoDB metrics
- Frontend error tracking

### User Analytics
- Clerk user analytics
- Custom event tracking
- Image generation metrics
- Gallery usage statistics

## Scalability Considerations

### Current Architecture (Free Tier)
- Supports ~1000 users
- ~10,000 image generations/month
- ~100GB storage

### Future Scaling Options
- Lambda provisioned concurrency
- DynamoDB on-demand scaling
- S3 Intelligent Tiering
- CloudFront global distribution
- Multi-region deployment

## Development Workflow

### Local Development
1. Frontend: `npm run dev` (Vite dev server)
2. Backend: `flask run` (Local Flask server)
3. Database: DynamoDB Local or AWS sandbox
4. Storage: Local file system or S3 sandbox

### Testing Strategy
- Unit tests for React components
- Integration tests for API endpoints
- End-to-end tests with Playwright
- Load testing for image generation

### CI/CD Pipeline
1. Code commit triggers GitHub Actions
2. Run tests and linting
3. Build frontend and backend
4. Deploy to staging environment
5. Run integration tests
6. Deploy to production (manual approval)

This architecture ensures a scalable, secure, and maintainable application that leverages AWS Free Tier resources effectively while providing a professional user experience.
