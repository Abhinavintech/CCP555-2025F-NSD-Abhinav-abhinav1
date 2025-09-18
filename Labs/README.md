# Lab 2: AWS Cognito Authentication with Fragments Microservice

This lab demonstrates how to implement secure authentication using AWS Cognito User Pools with a Node.js microservice backend and a web frontend.

## 🏗️ Project Structure

```
lab2/
├── fragments/                 # Backend microservice
│   ├── src/
│   │   ├── index.js          # Main entry point
│   │   ├── server.js         # Express server setup
│   │   ├── app.js            # Express app configuration
│   │   ├── auth.js           # JWT authentication middleware
│   │   ├── logger.js         # Logging configuration
│   │   └── routes/           # API routes
│   │       ├── index.js      # Main router
│   │       └── api/
│   │           ├── index.js  # API router
│   │           └── get.js    # GET /v1/fragments endpoint
│   ├── package.json
│   └── .env                  # Environment variables
├── fragments-ui/             # Frontend web application
│   ├── src/
│   │   ├── app.js           # Main application logic
│   │   ├── auth.js          # Cognito authentication
│   │   └── api.js           # API client
│   ├── index.html           # Main HTML file
│   ├── package.json
│   └── .env                 # Environment variables
├── diagrams/                 # Visual diagrams and documentation
│   ├── png/
│   │   ├── 4k/              # 4K resolution diagrams
│   │   └── hd/              # HD resolution diagrams
│   └── *.mmd                # Source Mermaid files
├── docs/                     # Additional documentation
│   ├── INSTRUCTOR_GUIDE.md  # Instructor setup guide
│   ├── MERMAID_DIAGRAMS.md  # Mermaid diagram source code
│   └── DIAGRAMS_SUMMARY.md  # Diagram specifications
├── setup.sh                 # Automated setup script
├── convert-diagrams.sh      # Diagram conversion script
├── .gitignore               # Git ignore rules
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- AWS CLI configured with appropriate credentials
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd lab2

# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Configure AWS credentials
- Create a Cognito User Pool
- Create a User Pool Client
- Create a User Pool Domain
- Generate environment files for both projects

### 2. Start the Backend Server

```bash
cd fragments
npm install
npm run dev
```

The backend will start on `http://localhost:8080`

### 3. Start the Frontend Application

```bash
cd fragments-ui
npm install
npm start
```

The frontend will start on `http://localhost:1234`

### 4. Test the Application

1. Open `http://localhost:1234` in your browser
2. Click the "Login" button
3. Create a new account or sign in with existing credentials
4. After authentication, you'll see a welcome message and logout button
5. Check the browser console to see successful API calls

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually or need to troubleshoot:

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd fragments
   npm install
   ```

2. **Configure Environment Variables**
   Create `fragments/.env`:
   ```env
   PORT=8080
   LOG_LEVEL=debug
   AWS_COGNITO_POOL_ID=us-east-1_your_pool_id
   AWS_COGNITO_CLIENT_ID=your_client_id
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd fragments-ui
   npm install
   ```

2. **Configure Environment Variables**
   Create `fragments-ui/.env`:
   ```env
   API_URL=http://localhost:8080
   AWS_COGNITO_POOL_ID=us-east-1_your_pool_id
   AWS_COGNITO_CLIENT_ID=your_client_id
   # Optional: domain prefix shown in your User Pool (e.g., fragments-ui-1234567890)
   AWS_COGNITO_DOMAIN=your_domain_prefix
   OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
   ```

3. **Start the Application**
   ```bash
   npm start
   ```

## 🔐 Authentication Flow

### 1. User Authentication
- User clicks "Login" button
- Redirected to AWS Cognito Hosted UI
- User signs up/signs in
- Cognito returns authorization code
- Frontend exchanges code for JWT tokens

### 2. API Authorization
- Frontend includes JWT token in API requests
- Backend validates token using AWS JWT Verifier
- Backend extracts user information from token
- API responds with user-specific data

### 3. Logout Process
- User clicks "Logout" button
- Frontend clears local session
- Redirects to Cognito logout endpoint
- User is logged out and redirected back

## 🛠️ Key Technologies

### Backend (fragments/)
- **Express.js** - Web framework
- **Passport.js** - Authentication middleware
- **aws-jwt-verify** - JWT token validation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend (fragments-ui/)
- **Parcel** - Build tool and dev server
- **oidc-client-ts** - OpenID Connect client
- **Fetch API** - HTTP requests

### AWS Services
- **Cognito User Pool** - User authentication
- **Cognito Hosted UI** - Login/logout interface

## 📝 API Endpoints

### Health Check
```
GET /
```
Returns server status and version information.

### Get User Fragments
```
GET /v1/fragments
Authorization: Bearer <jwt_token>
```
Returns fragments for the authenticated user.

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CORS middleware is enabled in the backend
   - Check that frontend URL matches CORS configuration

2. **Authentication Errors**
   - Verify Cognito User Pool configuration
   - Check environment variables are correct
   - Ensure OAuth flows are enabled

3. **JWT Validation Errors**
   - Verify User Pool ID and Client ID
   - Check that JWKS are properly cached
   - Ensure token is not expired

### Debug Steps

1. **Check Backend Logs**
   ```bash
   cd fragments
   npm run dev
   ```
   Look for "Cognito JWKS successfully cached" message

2. **Check Frontend Console**
   - Open browser DevTools
   - Look for authentication and API call logs

3. **Verify Environment Variables**
   ```bash
   # Backend
   cat fragments/.env
   
   # Frontend
   cat fragments-ui/.env
   ```

## 📚 Learning Objectives

After completing this lab, students will understand:

1. **OAuth 2.0 / OpenID Connect** - How modern authentication works
2. **JWT Tokens** - Structure and validation of JSON Web Tokens
3. **AWS Cognito** - Managed authentication service
4. **CORS** - Cross-origin resource sharing
5. **Microservice Security** - Protecting API endpoints
6. **Frontend-Backend Integration** - Secure communication patterns

## 🎯 Next Steps

This lab provides the foundation for:
- Adding more API endpoints
- Implementing fragment storage
- Adding user management features
- Deploying to cloud platforms
- Implementing role-based access control

## 📊 Visual Diagrams

This lab includes comprehensive visual diagrams to help understand the system architecture and authentication flow:

- **System Architecture** - Overall component relationships
- **Authentication Flow** - Step-by-step login process
- **Setup Process** - Automated setup workflow
- **JWT Validation** - Token validation process
- **Project Structure** - File organization
- **Error Handling** - API error management
- **CORS Configuration** - Cross-origin handling
- **Logout Process** - User logout sequence

### Diagram Formats
- **4K Resolution** (`diagrams/png/4k/`) - Ultra-high resolution for 4K displays
- **HD Resolution** (`diagrams/png/hd/`) - Standard resolution for compatibility
- **Source Files** (`diagrams/*.mmd`) - Mermaid source for customization

See `docs/DIAGRAMS_SUMMARY.md` for detailed specifications and usage instructions.

## 📖 Additional Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [JWT.io](https://jwt.io/) - JWT token decoder
- [Express.js Documentation](https://expressjs.com/)
- [Passport.js Documentation](http://www.passportjs.org/)

## 🤝 Contributing

This is a lab project for educational purposes. Feel free to:
- Add new features
- Improve error handling
- Enhance the UI
- Add tests
- Update documentation

## 📄 License

This project is for educational use in the Seneca College CCP555 course.
