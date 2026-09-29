# Vibely — Connect • Share • Discover

Vibely is a beginner-friendly full-stack social app. The React/Vite frontend lives in `frontend/`; the Express, MongoDB, and Twilio API lives in `backend/`.

## Requirements

- Node.js 20.19+ or 22.12+ and npm
- MongoDB running locally, or a MongoDB Atlas connection string
- A Twilio account and an SMS-capable Twilio phone number for real OTP delivery

## Install

Open a terminal in the `social-connect` folder and run:

```powershell
npm install
npm install --prefix frontend
npm install --prefix backend
```

Make local environment files from the examples:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Open `backend/.env` and set `JWT_SECRET` to a long random value. For example, generate one with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit `.env` files. The included `.gitignore` excludes them.

## MongoDB Setup

For a local database, install and start MongoDB Community Server. The example connection string uses `mongodb://127.0.0.1:27017/socialconnect`; MongoDB creates the database when the first account is saved.

For MongoDB Atlas, create a free cluster, create a database user, allow your development IP in Network Access, and copy the Node.js connection string into `MONGODB_URI` in `backend/.env`. Replace the sample username/password in that connection string with your database user's values. Keep the connection string private.

## Twilio Setup

In the Twilio Console, find your Account SID and Auth Token, and use an SMS-capable Twilio phone number. Put them in `backend/.env`:

```dotenv
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567
```

Use a full international phone number for both the Twilio number and registered user numbers. A Twilio trial account may only send messages to verified destination numbers. Without Twilio credentials, development mode returns a local test OTP in the verification screen. This fallback is disabled in production.

## Run Locally

Start both frontend and backend from `social-connect`:

```powershell
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`. The backend listens at `http://localhost:5000`; check `http://localhost:5000/api/health` to confirm it is running.

You can also start each part separately in its own terminal:

```powershell
npm run dev --prefix backend
npm run dev --prefix frontend
```

For a production frontend build:

```powershell
npm run build
```

## Environment Variables

`backend/.env`:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; defaults to `5000` |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Private signing key for login tokens |
| `CLIENT_ORIGIN` | Allowed frontend origin for CORS |
| `NODE_ENV` | Set to `production` for deployment |
| `TWILIO_ACCOUNT_SID` | Twilio account ID |
| `TWILIO_AUTH_TOKEN` | Private Twilio token |
| `TWILIO_PHONE_NUMBER` | SMS-capable Twilio number |

`frontend/.env`:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL, for example `http://localhost:5000/api` |

## API Overview

- `GET /api/health`
- `POST /api/auth/register`, `/send-otp`, `/verify-otp`, `/login`
- `GET /api/users?q=...`, `GET /api/users/:id`, `PUT /api/users/profile`
- `POST /api/users/:id/follow`, `POST /api/users/:id/unfollow`
- `GET /api/users/:id/followers` and `/following`
- `GET /api/posts`, `POST /api/posts`, `DELETE /api/posts/:id`
- `POST /api/posts/:id/like`
- `GET` and `POST /api/posts/:id/comments`; `DELETE /api/comments/:id`
- `GET /api/notifications`

Protected endpoints require `Authorization: Bearer <token>`.

## GitHub

Create an empty repository on GitHub, then from this project folder run these commands. Replace the example URL with your repository URL:

```powershell
git init
git add .
git commit -m "Build Vibely social app"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/YOUR-REPOSITORY.git
git push -u origin main
```

Check that `.env` files are not staged before pushing.

## Deployment

Deploy the backend as a Node web service (for example on Render): connect the repository, set the root directory to `backend`, use `npm install` as the build command and `npm start` as the start command. Add all backend environment variables in the host dashboard. Set `NODE_ENV=production`, use an Atlas `MONGODB_URI`, set `CLIENT_ORIGIN` to the deployed frontend URL, and add the Twilio values. Generate a new production `JWT_SECRET`.

Deploy the frontend (for example on Vercel): connect the same repository, set the root directory to `frontend`, use `npm install` and `npm run build`, then set `VITE_API_URL` to `https://YOUR-API-HOST/api`. Add that deployed frontend URL to the backend's `CLIENT_ORIGIN`. Redeploy the frontend after changing its environment variable.

## Notes

- Profile and post images are accepted as URLs; this starter does not upload image files.
- Sample feed items appear when the API cannot be reached. They are display-only; connect MongoDB and sign in to publish or interact with stored posts.
- OTPs expire after ten minutes. Store production secrets in your hosting provider's environment settings, never in source control.