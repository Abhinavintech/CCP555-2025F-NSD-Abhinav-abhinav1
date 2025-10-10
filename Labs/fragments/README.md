# Fragments Service — README

This document explains how the `Labs/fragments` microservice is built, how to run and test it, and what environment variables and optional dependencies it requires and is intended to make onboarding and CI straightforward.

## Project layout (important files)

- `src/`
  - `app.js` — Express application and middleware.
  - `server.js` — Starts the HTTP server (for local manual runs).
  - `routes/` — API route wiring (`/v1/fragments`).
  - `model/fragment.js` — Fragment model (metadata + data helpers).
  - `model/data.js` — Local filesystem storage backend (meta + blobs).
  - `storage-s3.js` — S3 storage adapter (async, uses AWS SDK v3).
  - `storage-factory.js` — Chooses between S3 and local backends and always exposes a Promise-based async API.
  - `auth/` — Authentication strategies (Cognito, basic `.htpasswd`, and wrapper `index.js`).
  - `content-types.js` — Content type whitelist/normalization.
  - `response.js` — Success/error JSON helpers.

- `data/` — persisted storage: `meta/` and `blobs/` (local backend only).
- `tests/Unit/` — Jest unit tests.

## Required environment variables

The service supports two authentication modes (Cognito or HTTP Basic). Only one should be configured at a time.

- For AWS Cognito (production-like):
  - `AWS_COGNITO_POOL_ID` — Cognito user pool id
  - `AWS_COGNITO_CLIENT_ID` — Cognito client id

- For HTTP Basic (development / lab):
  - `HTPASSWD_FILE` — Path to an htpasswd file used by `http-auth` (only used when `NODE_ENV !== 'production'`)

General configuration:
- `STORAGE_BACKEND` — `local` (default) or `s3`.
- `FRAGMENTS_S3_BUCKET` — S3 bucket name (required when `STORAGE_BACKEND=s3`).

Testing convenience:
- `NODE_ENV=test` — test mode; the `auth` wrapper exposes a dummy authentication helper so tests can run without Cognito or htpasswd.

## Optional dependencies

Several libraries are optional and used for improved functionality. The code uses `tryRequire`/guards and will return appropriate HTTP 415 errors if conversions are requested but the library is missing.

- `sharp` — Image conversion (png/jpeg/webp/avif/etc.). If missing, image conversion requests return 415.
- `pino-http` (and `pino`) — HTTP request logging. If missing, the app falls back to no pino logging.
- `helmet` — Security middleware. If missing, the app skips it.

Install optional packages if you want the extra behavior.

## How to run locally

1. Install dependencies:

```bash
npm install
```

2. Run the server (local filesystem storage):

```bash
# (optional) create test .env values if you want
NODE_ENV=development node src/server.js
```

3. By default the app will listen on the port configured in `src/server.js` (usually 3000).

4. Manual tests with curl:

```bash
# create a fragment
curl -i -X POST http://localhost:3000/v1/fragments \
  -H "Content-Type: text/plain" \
  --data-binary "hello world"

# list fragments (requires auth)
curl -i http://localhost:3000/v1/fragments
```

## Running tests (developer & CI)

This project uses Jest. To run all unit tests:

```bash
# run from Labs/fragments
npm test
# or
npx jest
```

Test environment notes:
- Tests set `NODE_ENV=test` and the `auth` wrapper exposes a no-op authenticate() so tests do not require Cognito or htpasswd by default.
- Some tests exercise the S3 adapter with a mocked client and do not require AWS credentials.
- If a test expects an `.htpasswd` file (older labs), create one under `tests/.htpasswd` and point `HTPASSWD_FILE` to it when running locally.

### Example: run tests locally with htpasswd

```bash
export NODE_ENV=test
export HTPASSWD_FILE=./tests/.htpasswd
npm test
```

## CI (GitHub Actions) snippet

Below is an example `ci/tests.yml` job to run in GitHub Actions. It runs tests in Node, sets `NODE_ENV=test`, and installs optional binaries (skip `sharp` if your CI can't build native modules) or use a prebuilt Node image that supports sharp.

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install deps
        run: npm ci
      - name: Run tests
        env:
          NODE_ENV: test
        run: npm test --silent
```

Notes on S3 mocking in CI:
- The repository's storage-s3 adapter is unit-tested using a mocked S3 client — you don't need AWS creds to run unit tests.
- If you want integration tests against real S3, set `STORAGE_BACKEND=s3` and provide AWS credentials in CI using secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`).

## Developer walkthrough

1. Read `src/model/fragment.js` — central model for fragments.
2. Examine `src/model/data.js` — local storage implementation; note `meta/` JSON files and `blobs/` binary files.
3. Review `src/storage-s3.js` — S3 adapter with `meta/<id>.json` and `blobs/<id>` keys.
4. Open `src/routes/api/*` — handlers for POST, GET (list), GET by id (and conversions), PUT, DELETE.
5. Auth behavior: `src/auth/index.js` chooses strategy:
   - `NODE_ENV=test` => no-op auth
   - Cognito when `AWS_COGNITO_*` set
   - Basic `.htpasswd` when `HTPASSWD_FILE` set (non-prod)

### How conversions work
- Conversions are in `src/routes/api/id.js` and use optional libraries:
  - JSON <-> YAML: `js-yaml`
  - CSV <-> JSON: `csv-parse/sync` and `csv-stringify/sync`
  - Markdown -> HTML: `marked`
  - Images: `sharp`

If a conversion is requested and the corresponding library is not installed, the route returns 415 with a helpful message.

## Screenshots & debugging

Include screenshots of API responses by running the example curl commands above and saving outputs. (CI environments typically don't include GUI screenshots.)

## Troubleshooting
- If you see `Unable to cache Cognito JWKS` in test logs, it's informational: Cognito JWKS hydration failed because AWS config isn't present — tests mock auth or run in test mode.
- If file permissions cause issues when writing `data/` files, ensure the process has write permissions to the repo folder.

---

If you'd like, I can also:
- Add the GitHub Actions workflow file to `.github/workflows/ci.yml`.
- Add a short `docs/architecture.md` with sequence diagrams and screenshots.

Tell me which extra docs you'd like and I'll add them.