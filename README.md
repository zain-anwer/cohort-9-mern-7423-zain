# Scribble — MERN Notes App

A full-stack notes application built with the MERN stack (MongoDB, Express, React, Node.js). Scribble lets authenticated users create, organize, and manage rich-text notes with real-time sync across sessions, along with a full user profile management system.

Built as part of the 10Pearls Shine Program (Cohort 9, MERN Domain).

## Features

### Authentication & Authorization
- Sign up, sign in, and sign out with JWT-based authentication (Authorization header, not cookies)
- Passwords hashed with bcrypt before storage
- Server-side token revocation on logout, backed by a MongoDB TTL-indexed collection so revoked tokens are automatically cleaned up once they'd have expired anyway
- Case-insensitive email handling for signup/signin consistency

### Notes Management
- Full CRUD (create, read, update, delete) for notes, scoped per authenticated user
- Rich text editing powered by Quill (`react-quill-new`)
- Autosave: edits save automatically after a short period of inactivity, with a debounced save indicator ("saving…" / "saved")
- **Pinning** — pin notes to keep them at the top of the default view
- **Archiving** — move notes out of the main view without deleting them
- **Binning** — soft-delete notes to a bin, with a separate permanent-delete action from within the bin
- Real-time updates via Socket.IO — changes made in one session (or by another connected client) reflect live without a manual refresh
- Search — filters notes by matching a query as a substring within the (HTML-stripped) title or content

### Import & Export
- Export any note as a downloadable `.txt` file
- Import a `.txt` file to create a new note from its contents

### User Profile
- View and update name
- Upload, update, and delete profile picture
- Change password
- Profile changes reflected in real time across open sessions

### Application Quality
- Structured logging throughout the backend via Pino, including HTTP request/response logging
- Centralized error-handling middleware with consistent error shapes and status codes
- Unit and integration tests: Mocha/Chai/Supertest/Sinon on the backend, Jest/React Testing Library on the frontend
- Static code analysis via SonarQube

## Tech Stack

**Frontend:** React (Vite), Zustand (state management), React Router, Tailwind CSS, Axios, Socket.IO client, react-quill-new, react-hot-toast

**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT (jsonwebtoken), bcrypt, Pino / pino-http

**Testing & Quality:** Mocha, Chai, Sinon, Supertest (backend) · Jest, React Testing Library (frontend) · SonarQube

**Tooling:** Git (fork-based branching workflow), ESLint, CodeRabbit (automated PR review)

## Getting Started

### Prerequisites
- Node.js
- A MongoDB instance (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# fill in MONGODB_URI, JWT_SECRET, PORT, etc. in .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# set VITE_BACKEND_URL to point at your running backend
npm run dev
```

## Running Tests

```bash
# backend
cd backend
npm run test

# frontend
cd frontend
npm run test
```

## Git Workflow

This project follows a fork-based contribution model with `main` and `develop` as the primary branches. Feature work happens on branches named `feature/<scope>/<description>`, `chore/<scope>/<description>`, or `fix/<scope>/<description>`, branched from and merged back into `develop` via pull request. Every PR is reviewed by an automated CodeRabbit review before mentor sign-off.

## License

This project was built for educational purposes as part of the 10Pearls Shine Program.