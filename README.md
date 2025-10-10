# CCP555-2025F-NSD-Abhinav-abhinav1

## Labs/fragments — notes

This repository contains a Fragments microservice used for the course labs.

Important scripts (run from `Labs/fragments`):

- `npm test` — run the unit tests (uses the Lab3 jest config)
- `npm run format` — run Prettier to format `src/**/*.js`
- `npm run coverage` — run tests with coverage and produce `coverage/` output

Linting decision:

- CI is pinned to ESLint v8 to avoid breaking student environments while we migrate to the ESLint v9 flat-config. The lint job in `.github/workflows/fragments-ci.yml` installs `eslint@8.45.0`.

Cleanup & sample-code extras:

- The `sample-code/` folder contains `demo-implementation.js` and `test-api.sh` which demonstrate usage of the sample server. You may keep them for reference or remove if you don't need them.
- The repository includes generated blob data under `Labs/fragments/data/` and metadata in `Labs/fragments/data/meta/`. These are gitignored by default — if you want to remove them from the repo entirely, delete the files and commit the deletion.
