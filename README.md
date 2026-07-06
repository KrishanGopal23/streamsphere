# StreamSphere

StreamSphere is a full-stack MERN application for synchronized YouTube watch rooms with realtime chat, reactions, queue management, host moderation, and room settings.

## Stack

- Frontend: React 19, Vite, React Router, Tailwind CSS, Framer Motion, Socket.IO Client, TanStack Query, Axios, React Hook Form, Zod, React Hot Toast, Emoji Picker, Lucide React
- Backend: Node.js, Express, Socket.IO, MongoDB Atlas, Mongoose, JWT-ready utilities, bcrypt, Helmet, Morgan, express-rate-limit, express-validator, CORS
- Deployment target: Render Static Site for frontend and Render Web Service for backend

## Local Setup

```bash
npm install
cp client/.env.example client/.env
cp server/.env.example server/.env
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Local Environment

Client:

```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Server:

```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/streamsphere
JWT_SECRET=replace-with-a-long-random-secret
YOUTUBE_API_KEY=replace-with-youtube-data-api-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

## Render Deployment

Use [DEPLOYMENT.md](./DEPLOYMENT.md) for the full start-to-finish guide: GitHub upload, MongoDB Atlas connection string, YouTube Data API key, Render backend deployment, Render frontend deployment, environment variables, CORS, and final testing.

This repo also includes [render.yaml](./render.yaml), a Render Blueprint with:

- `streamsphere-api`: Node web service for Express + Socket.IO
- `streamsphere-client`: static Vite frontend with React Router rewrites

## API

### Rooms

- `POST /api/rooms` creates a room.
- `POST /api/rooms/join` validates access and returns the room state.
- `GET /api/rooms/:roomId` returns a room snapshot.
- `PATCH /api/rooms/:roomId/settings` updates host-controlled settings.
- `DELETE /api/rooms/:roomId` deletes a room.

### Messages

- `GET /api/messages/:roomId` returns recent room messages.

### Queue

- `GET /api/queue/:roomId` returns room queue.
- `POST /api/queue/:roomId` adds a suggestion.
- `PATCH /api/queue/:roomId/:itemId/approve` approves a suggestion.
- `DELETE /api/queue/:roomId/:itemId` removes an item.

### YouTube Search

- `GET /api/youtube/search?q=lofi` searches videos through the YouTube Data API.

## Socket Events

`join-room`, `leave-room`, `disconnect`, `chat-message`, `typing-start`, `typing-stop`, `reaction`, `video-play`, `video-pause`, `video-seek`, `video-change`, `speed-change`, `volume-change`, `queue-add`, `queue-remove`, `host-transfer`, `member-kicked`, `room-locked`, `room-unlocked`, `sync-state`, `heartbeat`.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint --workspace client
npm run start --workspace server
```
