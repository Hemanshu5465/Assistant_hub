# Deploying AI Assistant Hub (GitHub + Vercel)

The repo is set up so **one Vercel project** serves both the static frontend
and the Express API (as a serverless function).

```
/                 static frontend (index.html, chat.html, forms/, admin/, css, js)
/config.js        picks the API base URL (localhost:5000 in dev, same-origin in prod)
/api/index.js     Vercel serverless entry -> backend/app.js (Express)
/vercel.json      routes /api/* and /uploads/* to the function
/backend/         the Express app, routes, models, db config
```

---

## 1. Rotate the leaked API keys  (do this first)

`backend/.env` was committed in an earlier commit, so these are public in the
git history and must be replaced:

| Key | Rotate at |
|-----|-----------|
| OpenAI  | https://platform.openai.com/api-keys |
| Gemini  | https://aistudio.google.com/apikey |
| Groq    | https://console.groq.com/keys |

`.env` is now git-ignored, so new values won't be committed.

## 2. Create a Postgres database (Neon)

1. https://neon.tech → new project.
2. Copy the **connection string** (looks like
   `postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`).

The app auto-enables SSL for a `DATABASE_URL`. Tables are created automatically
on first boot (`sequelize.sync()`).

## 3. Push to GitHub

```bash
git add -A
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## 4. Import into Vercel

1. https://vercel.com/new → import `Hemanshu5465/Assistant_hub`.
2. Framework preset: **Other**. Root directory: `/`. No build command. No output dir.
3. Add **Environment Variables** (Settings → Environment Variables):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | your Neon connection string |
   | `GROQ_API_KEY` | new Groq key |
   | `GOOGLE_CLIENT_ID` | your Google OAuth client ID (or leave unset) |
   | `JWT_SECRET` | any long random string |
   | `EMAIL_USER` | Gmail address (for forgot-password / contact) |
   | `EMAIL_PASS` | Gmail **app password** |

4. Deploy.

## 5. Post-deploy

- Visit `https://<project>.vercel.app` — the site loads.
- `https://<project>.vercel.app/api/` should return `API is running...` is
  **not** expected (health check is at `/`); instead test
  `https://<project>.vercel.app/api/auth/login` with a POST.
- Register + login + chat should all work.
- **Google Sign-In:** in Google Cloud Console, add
  `https://<project>.vercel.app` to the OAuth client's *Authorized JavaScript
  origins*, and replace `YOUR_GOOGLE_CLIENT_ID_HERE` in
  `forms/login.html` + `forms/register.html` with the real client ID.

---

## Known limitations on serverless

- **Uploaded files don't persist.** Vercel functions can only write to `/tmp`,
  which is wiped between invocations. Chat file-uploads and profile-avatar
  uploads will appear to work but the files 404 shortly after. To fix properly,
  move uploads to Vercel Blob / S3 / Cloudinary.
- **Cold starts.** First request after idle re-connects to Postgres (~1–2 s).

## Local development (unchanged)

```bash
cd backend
npm install
cp .env.example .env   # fill in local Postgres + GROQ_API_KEY
npm start              # http://localhost:5000
```
Then open the frontend with Live Server. `config.js` auto-points to
`localhost:5000`.
