# StreamSphere GitHub + Render Deployment Guide

This guide deploys both parts of StreamSphere on Render:

- Frontend: Render Static Site
- Backend: Render Web Service
- Database: MongoDB Atlas
- Video search: YouTube Data API key stored only on the backend

Official references used while preparing this guide:

- Render Static Sites: https://render.com/docs/static-sites
- Render Web Services: https://render.com/docs/web-services
- Render GitHub integration: https://render.com/docs/github
- Render monorepo support: https://render.com/docs/monorepo-support
- Render environment variables: https://render.com/docs/configure-environment-variables
- Render static rewrites: https://render.com/docs/redirects-rewrites
- YouTube Data API setup: https://developers.google.com/youtube/v3/getting-started
- YouTube API credentials: https://developers.google.com/youtube/registering_an_application

## 1. Prepare Locally

Install dependencies and confirm the frontend builds:

```bash
npm install
npm run build
npm run lint --workspace client
```

Create local env files only for local testing:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Do not commit `.env` files.

## 2. Create MongoDB Atlas Database

1. Go to https://www.mongodb.com/atlas and sign in.
2. Create a new project named `StreamSphere`.
3. Create a free or paid cluster.
4. Create a database user:
   - Username: choose anything, for example `streamsphere_user`
   - Password: generate a strong password and save it
5. Open Network Access.
6. Add an IP access rule:
   - For simplest Render deployment, use `0.0.0.0/0`
   - For stricter production security, restrict access when you know your outbound setup
7. Open Database > Connect > Drivers.
8. Copy the MongoDB connection string.
9. Replace `<password>` with your database user password.
10. Make sure the database name at the end is `streamsphere`.

Example:

```bash
mongodb+srv://streamsphere_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/streamsphere?retryWrites=true&w=majority
```

This value goes into the backend Render environment variable `MONGODB_URI`.

## 3. Get YouTube Data API Key

1. Go to https://console.cloud.google.com/.
2. Create or select a Google Cloud project.
3. Go to APIs & Services > Library.
4. Search for `YouTube Data API v3`.
5. Click Enable.
6. Go to APIs & Services > Credentials.
7. Click Create credentials > API key.
8. Copy the API key.
9. Open the key settings and restrict it:
   - API restrictions: restrict to `YouTube Data API v3`
   - Application restrictions: for server-side use, use IP restriction only if you have a stable outbound IP; otherwise leave unrestricted during first deploy and tighten later

This value goes into the backend Render environment variable `YOUTUBE_API_KEY`.

## 4. Upload Project to GitHub

From the project root:

```bash
git init
git add .
git commit -m "Initial StreamSphere app"
git branch -M main
```

Create a new empty GitHub repository named `streamsphere`.

Then connect your local repo:

```bash
git remote add origin https://github.com/YOUR_USERNAME/streamsphere.git
git push -u origin main
```

If GitHub asks for authentication, use GitHub login in your browser or a personal access token.

## 5. Deploy Backend on Render

1. Go to https://dashboard.render.com/.
2. Connect GitHub when Render asks.
3. Click New > Web Service.
4. Select your `streamsphere` GitHub repo.
5. Use these settings:

```text
Name: streamsphere-api
Runtime: Node
Branch: main
Root Directory: leave blank
Build Command: npm install
Start Command: npm run start --workspace server
Health Check Path: /api/health
```

6. Add backend environment variables:

```bash
NODE_ENV=production
CLIENT_URL=https://streamsphere-client.onrender.com
MONGODB_URI=your MongoDB Atlas connection string
JWT_SECRET=generate a long random string
YOUTUBE_API_KEY=your YouTube Data API key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

7. Click Create Web Service.
8. Wait for deploy to finish.
9. Open:

```text
https://streamsphere-api.onrender.com/api/health
```

You should see a JSON success response.

Important: if Render gives your backend a different URL, copy the actual backend URL and use it in the frontend env vars.

## 6. Deploy Frontend on Render

1. In Render, click New > Static Site.
2. Select the same `streamsphere` GitHub repo.
3. Use these settings:

```text
Name: streamsphere-client
Branch: main
Root Directory: leave blank
Build Command: npm install && npm run build --workspace client
Publish Directory: client/dist
```

4. Add frontend environment variables:

```bash
VITE_API_URL=https://streamsphere-api.onrender.com/api
VITE_SOCKET_URL=https://streamsphere-api.onrender.com
```

5. Add React Router rewrite:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

6. Click Create Static Site.
7. Wait for deploy to finish.
8. Open:

```text
https://streamsphere-client.onrender.com
```

## 7. Update Backend CORS After Frontend URL Is Final

If the frontend URL is not exactly `https://streamsphere-client.onrender.com`, update the backend Render env var:

```bash
CLIENT_URL=https://YOUR_ACTUAL_FRONTEND_URL.onrender.com
```

Then choose Save, rebuild, and deploy on the backend service.

If you have multiple frontend URLs, separate them with commas:

```bash
CLIENT_URL=https://streamsphere-client.onrender.com,https://www.yourdomain.com
```

## 8. Optional Blueprint Deploy

This repo includes `render.yaml`.

In Render:

1. Click New > Blueprint.
2. Select the GitHub repo.
3. Render reads `render.yaml`.
4. Fill the prompted secret values:
   - `MONGODB_URI`
   - `YOUTUBE_API_KEY`
5. Create the Blueprint.

The Blueprint creates:

- `streamsphere-api`
- `streamsphere-client`

If Render assigns different service URLs, update:

- Backend `CLIENT_URL`
- Frontend `VITE_API_URL`
- Frontend `VITE_SOCKET_URL`

Then redeploy both services.

## 9. Final Smoke Test

1. Open the frontend Render URL.
2. Create a room.
3. Copy the room invite link.
4. Open it in another browser or incognito window.
5. Join with a different nickname.
6. Search for a YouTube video.
7. Change the video as host.
8. Confirm both browsers sync play, pause, seek, volume, speed, chat, queue, members, and reactions.

## 10. Common Fixes

Backend health check fails:

- Check `MONGODB_URI`.
- Confirm MongoDB Atlas network access allows Render.
- Check Render backend logs.

Frontend loads but API calls fail:

- Confirm `VITE_API_URL` ends with `/api`.
- Confirm backend `CLIENT_URL` exactly matches the frontend URL.
- Redeploy frontend after changing `VITE_*` values because Vite injects them at build time.

Socket does not connect:

- Confirm `VITE_SOCKET_URL` is the backend root URL without `/api`.
- Confirm backend service is running.
- Check browser console for CORS errors.

YouTube search fails:

- Confirm `YOUTUBE_API_KEY` exists on the backend service.
- Confirm YouTube Data API v3 is enabled.
- Check Google Cloud quota usage.
