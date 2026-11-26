# Notes — 10Pearls Internship

Full-stack notes application for Muhammad Saad. This first feature establishes the React and Node.js TypeScript projects. Authentication, MySQL storage, rich text notes, frontend Jest tests, and SonarQube integration follow in separate feature PRs.

## Requirements

- Node.js 24 LTS and npm
- Git
- MySQL will be required by the database feature; this setup does not need it yet.

## Run locally

From the repository root:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5173 for the frontend. API health: http://localhost:3000/api/health. The Vite development proxy forwards /api requests to port 3000; update the proxy if you change PORT. Never commit your .env file.

## Checks

```powershell
npm run typecheck
npm run build
npm test
```

Backend Mocha/Chai tests use the compiled server, so build before running tests. GitHub Actions runs these checks on PRs into develop and main. Pino records HTTP requests and errors; authorization and cookie headers are redacted. The server provides JSON 404 and error responses.

## Structure

- client/: React, TypeScript, Vite, responsive starter page
- server/: Express, TypeScript, Pino, health API, Mocha/Chai tests
- .github/workflows/: automated checks

## Contribution flow

Create each feature branch from develop, push the feature branch, and open its PR into develop. Share the feature PR link with the assigned professor on Discord. After development is complete, open develop → main as the final PR. CodeRabbit is configured to review PRs targeting both branches.

The frontend production build is in client/dist; the backend build is in server/dist. This foundation does not yet configure production hosting or serve frontend files from Express.

## Known dependency findings

The dependency audit reports three moderate findings in the Mocha development dependency chain (Mocha, glob, minimatch). No high or critical findings remain. Review these as upstream fixes become available.
