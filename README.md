# Realtime Collab App

A full-stack collaborative document editor with authentication, shared access, realtime presence, cursor synchronization, autosave, and AI-assisted writing tools.

## What It Does

- User registration and login with JWT authentication
- Create, open, share, and delete documents
- Realtime collaborative editing through Socket.IO
- Shared cursor and active-user presence in open documents
- Autosave document content to MongoDB
- AI-assisted content generation and grammar improvement

## Tech Stack

- Frontend: React, Vite, React Router, Quill, Socket.IO client, Axios
- Backend: Node.js, Express, Socket.IO, Mongoose, JWT, bcrypt
- Data: MongoDB
- AI: OpenRouter chat completions API

## Project Structure

- backend: Express API, Socket.IO server, MongoDB models, controllers, and middleware
- frontend: React app with dashboard, editor, auth pages, and API wrappers

## Prerequisites

- Node.js 18 or newer
- MongoDB connection string
- OpenRouter API key for AI features

## Environment Variables

Create a backend .env file in backend/ with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_API_KEY=your_openrouter_api_key
```

Create a frontend .env file in frontend/ with:

```env
VITE_API_URL=http://localhost:5000
```

## Local Setup

1. Install backend dependencies

```bash
cd backend
npm install
```

2. Install frontend dependencies

```bash
cd ../frontend
npm install
```

3. Start the backend

```bash
cd ../backend
npm run dev
```

4. Start the frontend

```bash
cd ../frontend
npm run dev
```

The frontend runs on Vite's default port, and the backend listens on port 5000 unless overridden.

## Available Scripts

### Backend

- npm run dev: Start the API with nodemon
- npm start: Start the API with Node.js

### Frontend

- npm run dev: Start the Vite development server
- npm run build: Create a production build
- npm run preview: Preview the production build locally
- npm run lint: Run ESLint

## API Overview

### Auth

- POST /auth/register
- POST /auth/login

### Documents

All document routes require a valid JWT.

- GET /documents
- GET /documents/:id
- POST /documents
- DELETE /documents/:id
- POST /documents/share/:id

### AI

All AI routes require a valid JWT.

- POST /ai/generate-content
- POST /ai/improve-grammar
- POST /ai/generate-content-for-document

## Realtime Behavior

- Clients connect to the backend Socket.IO server at http://localhost:5000
- Opening a document joins a document room
- Edits are broadcast to other users in the same room
- Cursor movement is shared so collaborators can see active selections
- Document content is autosaved every 2 seconds while the editor is open

## Notes

- The backend expects MongoDB and JWT configuration before users can authenticate.
- The frontend stores the auth token and user profile in localStorage.
- AI responses are generated through OpenRouter and inserted into the editor on demand.
