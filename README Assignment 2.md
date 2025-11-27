# Assignment 2 - Implementation Summary

## Completed Tasks

### API Server (fragments)

✅ **Docker Configuration**
- Multi-stage Dockerfile with Alpine Linux base
- .dockerignore file configured
- Non-root user (fragments:nodejs)
- Health check implemented
- Production-optimized build

✅ **API Endpoints**
- `POST /fragments` - Creates text/* and application/json fragments
- `GET /fragments` - Returns list of fragment IDs
- `GET /fragments?expand=1` - Returns expanded metadata
- `GET /fragments/:id` - Returns fragment data
- `GET /fragments/:id/info` - Returns fragment metadata
- `GET /fragments/:id.ext` - Converts fragments (markdown to HTML)
- `PUT /fragments/:id` - Updates fragment
- `DELETE /fragments/:id` - Deletes fragment

✅ **Content Type Support**
- text/plain
- text/markdown
- text/html
- text/csv
- application/json
- application/yaml
- image/* (png, jpeg, webp, gif, avif)

✅ **Conversions**
- Markdown (.md) to HTML (.html) using markdown-it
- JSON to YAML and vice versa
- CSV to JSON and vice versa
- Image format conversions using sharp

✅ **CI/CD**
- GitHub Actions workflow: `fragments-docker-ci.yml`
- ESLint validation
- Hadolint Dockerfile linting
- Unit tests
- Automatic Docker Hub publishing on push to main

### Front-End (fragments-ui)

✅ **Docker Configuration**
- Multi-stage Dockerfile (Node.js build + nginx serve)
- .dockerignore file configured
- Non-root nginx user
- Health check implemented

✅ **UI Features**
- User authentication via AWS Cognito
- Fragment creation with content type selection:
  - Plain Text
  - Markdown
  - HTML
  - JSON
  - CSV
- Display all user fragments with expanded metadata
- Refresh fragments list
- Visual feedback for operations
- Basic styling for better UX

## Setup Instructions

### Prerequisites
1. Docker Hub account
2. AWS Account with Cognito User Pool configured
3. GitHub repository with secrets configured

### Required GitHub Secrets
Add these to your repository settings:
- `DOCKERHUB_USERNAME` - Your Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub access token

### Environment Variables

#### For fragments API (.env)
```bash
# Server
PORT=8080
NODE_ENV=production

# AWS Cognito
AWS_COGNITO_POOL_ID=your-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id

# Storage (optional)
STORAGE_BACKEND=memory  # or s3
```

#### For fragments-ui (.env)
```bash
# API endpoint
API_URL=http://localhost:8080

# AWS Cognito
AWS_COGNITO_POOL_ID=your-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id
AWS_COGNITO_DOMAIN=your-domain-prefix
OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
```

## Local Development

### Fragments API
```bash
cd Labs/fragments
npm install
npm run dev
```

### Fragments UI
```bash
cd Labs/fragments-ui
npm install
npm start
```

## Docker Commands

### Build and Run Fragments API
```bash
cd Labs/fragments
docker build -t fragments:latest .
docker run -p 8080:8080 \
  -e AWS_COGNITO_POOL_ID=your-pool-id \
  -e AWS_COGNITO_CLIENT_ID=your-client-id \
  fragments:latest
```

### Build and Run Fragments UI
```bash
cd Labs/fragments-ui
docker build -t fragments-ui:latest .
docker run -p 80:80 fragments-ui:latest
```

## Testing

### Run Unit Tests
```bash
cd Labs/fragments
npm test
```

### Run Coverage Report
```bash
cd Labs/fragments
npm run coverage
```

Expected coverage: >80% for all source files

## Deployment to EC2

### Pull from Docker Hub
```bash
# Login to Docker Hub
docker login

# Pull the image
docker pull <your-dockerhub-username>/fragments:latest

# Run the container
docker run -d -p 8080:8080 \
  -e AWS_COGNITO_POOL_ID=your-pool-id \
  -e AWS_COGNITO_CLIENT_ID=your-client-id \
  --name fragments \
  <your-dockerhub-username>/fragments:latest
```

### Verify Deployment
```bash
# Check health endpoint
curl http://localhost:8080/v1/

# Expected response:
# {"status":"ok","author":"Abhinav","githubUrl":"...","version":"0.7.0"}
```

## API Testing Examples

### Create a Plain Text Fragment
```bash
curl -X POST http://localhost:8080/v1/fragments \
  -H "Content-Type: text/plain" \
  -H "Authorization: Bearer <token>" \
  -d "This is a plain text fragment"
```

### Create a Markdown Fragment
```bash
curl -X POST http://localhost:8080/v1/fragments \
  -H "Content-Type: text/markdown" \
  -H "Authorization: Bearer <token>" \
  -d "# Hello World\nThis is **markdown**"
```

### Create a JSON Fragment
```bash
curl -X POST http://localhost:8080/v1/fragments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"John","age":30}'
```

### Get All Fragments (Expanded)
```bash
curl http://localhost:8080/v1/fragments?expand=1 \
  -H "Authorization: Bearer <token>"
```

### Get Fragment by ID
```bash
curl http://localhost:8080/v1/fragments/<fragment-id> \
  -H "Authorization: Bearer <token>"
```

### Convert Markdown to HTML
```bash
curl http://localhost:8080/v1/fragments/<fragment-id>.html \
  -H "Authorization: Bearer <token>"
```

### Get Fragment Metadata
```bash
curl http://localhost:8080/v1/fragments/<fragment-id>/info \
  -H "Authorization: Bearer <token>"
```

## Technical Report Checklist

### Required Screenshots
1. ✅ Hadolint validation (clean output)
2. ✅ GitHub Actions CI workflow (all jobs passing)
3. ✅ Docker Hub repository with tags
4. ✅ Fragments API running on EC2 (health check response)
5. ✅ Fragments UI - User authentication
6. ✅ Fragments UI - Display existing fragments with metadata
7. ✅ Fragments UI - Create JSON fragment (with Location header)
8. ✅ Fragments UI - Create Markdown fragment
9. ✅ npm run coverage output (>80% coverage)

### Report Sections
1. Introduction - Updates since Assignment 1
2. GitHub Repository Links
3. Docker Hub Repository Links
4. CI Workflow Link
5. EC2 Deployment Screenshots
6. UI Functionality Screenshots
7. Test Coverage Screenshot
8. Conclusion - Known issues and future work

## Known Issues / Future Enhancements

- [ ] Add image upload support in UI
- [ ] Implement fragment deletion in UI
- [ ] Add fragment update functionality in UI
- [ ] Improve error handling and user feedback
- [ ] Add loading indicators
- [ ] Implement fragment preview
- [ ] Add pagination for large fragment lists

## Repository Structure
```
CCP555-2025F-NSD-Abhinav-abhinav1/
├── .github/
│   └── workflows/
│       └── fragments-docker-ci.yml
├── Labs/
│   ├── fragments/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   └── package.json
│   └── fragments-ui/
│       ├── src/
│       ├── Dockerfile
│       ├── .dockerignore
│       ├── index.html
│       └── package.json
└── Assignment 2 Checklist.md
```

## Version
- Fragments API: v0.7.0
- Fragments UI: v0.0.1
- Last Updated: 2025

## Author
Abhinav
