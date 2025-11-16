Deploying HerbiGPT Backend (quick guide)

This repo contains a simple Node/Express backend (local LLM fallback) that can be deployed to Render, Railway, or similar platforms.

Recommended quick deploy (Render)

1. Go to https://dashboard.render.com and create a new Web Service.
2. Connect your GitHub repo and select the `backend` directory as the root (or the repo root and set the build command accordingly).
3. Build Command: `npm install`
4. Start Command: `npm start` (package.json already includes `start` pointing to `server_groq.js`)
5. Environment variables:
   - `PORT` (optional, Render provides one)
   - Any LLM/API keys if you plan to enable production LLMs (e.g. `GROQ_API_KEY`, `GOOGLE_API_KEY`).
6. Deploy. Render will provide an HTTPS URL like `https://your-service.onrender.com`.

Railway is similar: create a new project, connect repo, set root/service, and set the start command `npm start`.

Netlify configuration (frontend)

1. In your Netlify site settings -> Build & deploy -> Environment, set:
   - `REACT_APP_API_URL` = `https://your-backend-url` (use the HTTPS URL from the deployed backend)
2. Trigger a new deploy (rebuild) from Netlify UI or push a new commit — the frontend will now call the live backend at `REACT_APP_API_URL`.

Notes

- The backend uses CORS (already enabled) and now respects `process.env.PORT` and binds to `0.0.0.0` so it can run in cloud hosts.
- Keep secrets (API keys) private in the host provider's environment variables.
- After deployment, test `GET /health` and `POST /ask` to ensure connectivity.

GitHub Actions automated deploy (optional)

There is a GitHub Actions workflow in `.github/workflows/deploy-backend-and-netlify.yml` that can:

- Trigger a deployment on Render when you push to the `deploy/backend-ready` branch (uses the Render Deploy API).
- Optionally update your Netlify site's environment variable `REACT_APP_API_URL` if you provide `BACKEND_URL` and Netlify API credentials.

To use it, add these GitHub repository secrets (Repository -> Settings -> Secrets & variables -> Actions):

- `RENDER_SERVICE_ID` — your Render service id (for the backend service)
- `RENDER_API_KEY` — your Render API key (service deploy permission)
- `NETLIFY_AUTH_TOKEN` — Netlify personal access token (optional, for updating environment variables)
- `NETLIFY_SITE_ID` — Netlify site id for your frontend site (optional)
- `BACKEND_URL` — the public HTTPS URL of your deployed backend (optional; if omitted you can update Netlify manually)

Once the secrets are added, push to `deploy/backend-ready` or run the workflow manually via GitHub UI to trigger the process.

If you prefer not to use CI for this, deploy on Render/Railway manually and then set `REACT_APP_API_URL` in Netlify's site settings (Build & deploy -> Environment) to your backend URL.
