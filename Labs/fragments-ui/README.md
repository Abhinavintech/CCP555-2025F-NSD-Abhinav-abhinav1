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

Deployment notes (Cognito callback & HTTPS)
-------------------------------------------------
When deploying the UI to EC2 you must serve the UI over HTTPS and register the HTTPS callback URL in Cognito. Cognito rejects non-localhost HTTP callback URLs.

If your instance has a public domain `ec2-XX-YY-...amazonaws.com` and you want to use that as the UI origin, you need to:

1. Associate an Elastic IP (optional, recommended) so the public DNS persists between restarts.
2. Serve the UI at `https://your-domain` (see `deploy/` for an Nginx + certbot setup script `deploy/setup-ec2.sh`).
3. In the Cognito App client settings add the callback URL: `https://your-domain` and the sign out URL `https://your-domain`.

CloudFront alternative
-----------------------
You can also upload `dist/` to an S3 bucket and put a CloudFront distribution in front of it to get HTTPS easily via ACM. Then use the CloudFront domain as the Cognito callback.

Example steps:
- Build UI: `npm run build`
- Upload `dist/` to S3: `aws s3 sync dist/ s3://your-bucket/`
- Create CloudFront distribution with the S3 bucket as origin and enable HTTPS with an ACM certificate.
- Add CloudFront domain to Cognito callback URLs.

