# PromptCanvas Pro 🎨

A professional AI-powered image generation platform built with React, Flask, and deployed on cloud infrastructure. Generate stunning 4K images from text prompts using the Flux.1-schnell-Free API from Together AI.

## ✨ Core Features

### 🎯 **Image Generation**
- **High-Quality Output**: 4K-capable images using Flux.1-schnell-Free
- **Multiple Resolutions**: Support for various aspect ratios and sizes
- **Style Controls**: Customize quality settings and generation parameters
- **Real-time Preview**: Instant feedback during generation process
- **Negative Prompts**: Advanced control over unwanted elements

### 🔐 **Authentication & Security**
- **Secure Login/Signup**: Powered by Clerk authentication
- **User Profiles**: Personalized user experience and settings
- **Session Management**: Secure token-based authentication
- **Privacy Protection**: GDPR-compliant data handling
- **Role-based Access**: Admin and user role management

### 📱 **User Interface**
- **Responsive Design**: Beautiful UI with Tailwind CSS
- **Mobile-First Approach**: Optimized for all screen sizes
- **Adaptive Sidebar**: Context-aware navigation for authenticated/non-authenticated users
- **Professional Layout**: Full-screen pages with consistent design
- **Accessibility**: WCAG 2.1 compliant interface

## 🚀 Advanced Features

### 🧠 **Smart Prompt Enhancement** *(NEW)*
- **AI-Powered Suggestions**: Intelligent prompt improvement recommendations
- **Category-Based Enhancement**: Style, Lighting, Composition, and Quality optimizations
- **One-Click Apply**: Instantly apply suggested improvements
- **Pro Tips**: Built-in guidance for better prompt writing
- **Real-time Feedback**: Interactive enhancement interface

### 🎨 **Enhanced Gallery Management** *(NEW)*
- **Smart Search**: Advanced search with auto-generated tags
- **Intelligent Filtering**: Filter by favorites, date, resolution, and content
- **Multiple View Modes**: Grid and list views with sorting options
- **Auto-Tagging**: Automatic content analysis and categorization
- **Bulk Operations**: Select and manage multiple images at once
- **Content Recognition**: AI-powered image metadata extraction

### 📚 **Comprehensive Information Architecture**
- **Professional About Page**: Company mission, values, and technology showcase
- **Full-Screen Documentation**: Immersive reading experience for all content pages
- **Help Center**: Extensive FAQ and troubleshooting guides
- **API Documentation**: Complete developer resources
- **Legal Compliance**: Privacy Policy, Terms of Service, Cookie Policy, DMCA
- **Status Monitoring**: Real-time system status and updates

### 🛠️ **Developer Features**
- **Modern Architecture**: React 18+ with Vite for optimal performance
- **Component Library**: Reusable UI components with consistent design
- **State Management**: Efficient data flow and caching
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance Optimization**: Lazy loading and code splitting
- **Hot Module Replacement**: Fast development with instant updates

## 🛠️ Tech Stack

### Frontend
- **React 18+** with Vite for fast development and builds
- **Tailwind CSS** for responsive styling and design system
- **Clerk** for secure authentication and user management
- **React Router** for client-side navigation
- **Lucide React** for consistent iconography
- **OpenAI SDK** for LLM integration (prompt enhancement)
- **React Markdown** for rich text rendering

### Backend
- **Flask** (Python) with RESTful API design
- **Together AI** for FLUX.1-schnell-Free image generation
- **AWS S3** for scalable image storage
- **DynamoDB** for fast metadata storage
- **Gunicorn** for production WSGI server
- **CORS** enabled for cross-origin requests

### Infrastructure & DevOps
- **Cloud-native deployment** ready
- **Environment-based configuration** for multiple stages
- **Scalable microservices architecture**
- **CDN integration** for fast image delivery
- **Health monitoring** and status endpoints
- **Error tracking** and logging

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Cloud Storage Account (AWS S3, Google Cloud Storage, etc.)
- Clerk Account (for authentication)
- Together AI Account (for image generation)
- Git (for version control)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/promptcanvas-pro.git
   cd promptcanvas-pro
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Configure environment variables**
   ```bash
   # Copy example files
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   
   # Edit the .env files with your API keys
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5174` and the backend at `http://localhost:5000`.

## 🔧 Configuration

### Required API Keys

1. **Clerk Authentication**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy the publishable and secret keys

2. **Together AI**
   - Sign up at [together.ai](https://together.ai)
   - Get your API key from the dashboard
   - Ensure access to Flux.1-schnell-Free model

3. **Cloud Services**
   - Set up cloud storage account
   - Configure storage buckets and database tables
   - Set up appropriate permissions

### Environment Variables

#### Frontend (.env)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_BASE_URL=http://localhost:5000
VITE_CLOUD_REGION=us-east-1
```

#### Backend (.env)
```env
CLERK_SECRET_KEY=sk_test_your_key_here
TOGETHER_AI_API_KEY=your_together_ai_key_here
CLOUD_ACCESS_KEY_ID=your_cloud_access_key
CLOUD_SECRET_ACCESS_KEY=your_cloud_secret_key
STORAGE_BUCKET_NAME=your-bucket-name
```

## 🏗️ Architecture

```
Frontend (React + Vite)     Backend (Flask)          External APIs
┌─────────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  • Authentication  │◄──►│  • JWT Validation│◄──►│  • Clerk Auth   │
│  • Image Gallery   │    │  • Image Gen API │    │  • Together AI  │
│  • Prompt Interface │    │  • Gallery API   │    └─────────────────┘
└─────────────────────┘    └─────────────────┘
         │                          │
         │                          │
         ▼                          ▼
┌─────────────────────┐    ┌─────────────────┐
│   Cloud CDN        │    │   Cloud Functions│
│   + Static Hosting │    │   + API Gateway │
└─────────────────────┘    └─────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │  Cloud Storage  │
                           │  + Database     │
                           └─────────────────┘
```

## 📁 Project Structure

```
promptcanvas-pro/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Flask API
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic
│   ├── models/             # Data models
│   ├── utils/              # Utility functions
│   └── requirements.txt    # Python dependencies
├── docs/                   # Documentation
├── deployment/             # Deployment scripts
└── README.md              # This file
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Building
npm run build           # Build frontend for production
npm run build:backend   # Install backend dependencies

# Testing
npm run test            # Run all tests
npm run test:frontend   # Run frontend tests
npm run test:backend    # Run backend tests

# Linting
npm run lint            # Lint all code
npm run lint:frontend   # Lint frontend code
npm run lint:backend    # Lint backend code

# Deployment
npm run deploy:frontend # Deploy frontend to cloud storage
npm run deploy:backend  # Deploy backend to cloud functions
```

### Adding New Features

1. **Frontend Components**: Add to `frontend/src/components/`
2. **API Endpoints**: Add to `backend/routes/`
3. **Database Models**: Add to `backend/models/`
4. **Services**: Add business logic to `backend/services/`

## 🚀 Deployment

### Cloud Deployment

1. **Frontend (Static Hosting + CDN)**
   ```bash
   cd frontend
   npm run build
   # Upload dist/ files to your cloud storage bucket
   ```

2. **Backend (Cloud Functions + API Gateway)**
   ```bash
   cd backend
   # Package and deploy using your cloud provider's CLI or framework
   ```

3. **Database Setup**
   - Create database tables
   - Configure storage bucket policies
   - Set up access roles and permissions

### Production Considerations

- Enable CDN caching
- Configure custom domain
- Set up SSL certificates
- Enable monitoring and logging
- Configure backup strategies

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
```

### Backend Testing
```bash
cd backend
python -m pytest
```

### End-to-End Testing
```bash
npm run test:e2e
```

## 📊 Monitoring

- **Cloud Monitoring**: Function and API Gateway metrics
- **Access Logs**: Frontend usage analytics
- **Database Metrics**: Database performance
- **Custom Analytics**: User behavior tracking

## 📋 Features Overview

### ✅ **Core Features**
- **High-Quality Image Generation**: FLUX.1-schnell-Free AI model
- **Secure Authentication**: Clerk-powered user management
- **Personal Gallery**: Advanced image organization and management
- **Prompt History**: Track and reuse successful prompts
- **Responsive Design**: Optimized for all devices and screen sizes
- **Cloud Storage**: Scalable AWS S3 integration

### ✅ **Advanced Features** *(Recently Added)*
- **Smart Prompt Enhancement**: AI-powered prompt improvement suggestions
- **Enhanced Gallery Search**: Auto-tagging and intelligent filtering
- **Professional Documentation**: Full-screen information pages
- **Adaptive Navigation**: Context-aware sidebar for different user states
- **Content Recognition**: Automatic image metadata extraction
- **Bulk Operations**: Multi-select and batch management

### ✅ **Developer & Admin Features**
- **Admin Dashboard**: Comprehensive platform management tools
- **API Documentation**: Complete developer resources
- **Performance Monitoring**: Real-time system status
- **Error Handling**: Comprehensive error boundaries
- **Hot Reloading**: Fast development experience

## 🆕 Recent Updates

### Version 2.0 - Advanced Features Release
- ✨ **Smart Prompt Enhancement**: AI-powered suggestions for better prompts
- 🔍 **Enhanced Gallery**: Advanced search, filtering, and auto-tagging
- 📱 **Improved Mobile Experience**: Adaptive sidebar and responsive design
- 📚 **Professional Documentation**: Full-screen pages for all content
- 🎨 **UI/UX Improvements**: Consistent design system and better accessibility
- 🛠️ **Developer Experience**: Better error handling and performance optimization

### Navigation Improvements
- **Desktop**: Clean interface with sidebar only for authenticated users
- **Mobile**: Accessible sidebar for all users with basic features for guests
- **Authentication Flow**: Seamless sign-in/sign-up experience
- **User Context**: Different navigation based on authentication status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Together AI](https://together.ai) for the Flux.1-schnell-Free API
- [Clerk](https://clerk.com) for authentication services
- [OpenAI](https://openai.com) for LLM integration capabilities
- [Vite](https://vitejs.dev) for fast development and build tooling
- [Tailwind CSS](https://tailwindcss.com) for the design system
- [Lucide](https://lucide.dev) for beautiful icons
- Cloud infrastructure providers for hosting and storage
- [React](https://reactjs.org) and [Flask](https://flask.palletsprojects.com) communities
- Open source contributors and the developer community

---

**PromptCanvas Pro** - Transforming imagination into visual reality with AI 🎨✨

## 📞 Support

- 📧 Email: support@promptcanvaspro.com
- 💬 Discord: [Join our community](https://discord.gg/promptcanvaspro)
- 📖 Documentation: [docs.promptcanvaspro.com](https://docs.promptcanvaspro.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/promptcanvas-pro/issues)

---

Made with ❤️ by the PromptCanvas Pro Team
