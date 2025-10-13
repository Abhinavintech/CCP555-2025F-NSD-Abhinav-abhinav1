Fragments UI

Small manual test UI for the fragments service. Use this to exercise login (Cognito Hosted UI) and create simple text fragments.

Quick start

- Copy environment variables into a `.env` file in this folder (see `.env.example`).
- Install dependencies: `npm install`
- Start dev server: `npm start`

Env variables used
- API_URL - backend fragments API base URL (default: http://localhost:8080)
- AWS_COGNITO_DOMAIN - Cognito Hosted UI domain prefix (ex: myapp-domain)
- AWS_COGNITO_POOL_ID - user pool id (e.g. us-east-1_XXXXXXXXX)
- AWS_COGNITO_CLIENT_ID - app client id
- OAUTH_SIGN_IN_REDIRECT_URL - redirect url used for the hosted UI (e.g. http://localhost:1234)

Testing checklist
- [ ] Start fragments server (Labs/fragments) on localhost
- [ ] Configure `.env` with API_URL=http://localhost:8080 and Cognito values
- [ ] `npm start` in this folder and open the page
- [ ] Click Login and complete the Cognito Hosted UI flow
- [ ] Create a simple text fragment and verify it appears in the backend
