# Haizier MVP

Haizier is a full-stack educational financial decision-support prototype for BUS4012 Assignment 3. It uses a React/Vite frontend, a Python/FastAPI backend, Alpha Vantage market data, and Supabase persistence.

Haizier is for educational decision support only. It does not provide financial advice and does not execute trades.

## Full-stack architecture

```text
React/Vite frontend
  ↓ calls backend only
Python/FastAPI backend under api/
  ↓ securely calls
Alpha Vantage market data API
  ↓ saves analysis records to
Supabase haizier_analyses table
```

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Python, FastAPI, Uvicorn
- **Market data:** Alpha Vantage API
- **Database:** Supabase
- **Deployment target:** Vercel

## Repository structure

```text
haizier-mvp/
├─ api/                         # Python/FastAPI backend
│  ├─ app/
│  │  ├─ main.py                # FastAPI app and CORS setup
│  │  ├─ config.py              # Environment variable loading
│  │  ├─ routes/analysis.py     # POST /api/analyze
│  │  └─ services/              # Alpha Vantage, scoring, Supabase services
│  ├─ index.py                  # Vercel Python entrypoint
│  ├─ requirements.txt
│  └─ README.md
├─ src/                         # React/Vite frontend
│  ├─ components/
│  ├─ services/apiClient.ts     # Calls backend API only
│  ├─ App.tsx
│  └─ main.tsx
├─ supabase/
│  └─ schema.sql                # Supabase table definition
├─ .env.example                 # Variable names only, no secrets
├─ .gitignore
├─ vercel.json
└─ package.json
```

## Secure environment variable handling

Real secrets must never be committed to GitHub.

The root `.env.example` intentionally contains variable names only:

```env
VITE_API_BASE_URL=
ALPHA_VANTAGE_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Local secret files such as `.env`, `.env.local`, and `api/.env` are ignored by Git.

### Frontend variable

- `VITE_API_BASE_URL` points the browser to the backend URL.
- For local development, this is usually `http://localhost:8000`.
- In Vercel, this can usually be `/` or your deployed app URL depending on routing.

### Backend variables

These are used only by the Python backend:

- `ALPHA_VANTAGE_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The frontend does not import Supabase credentials and does not call Supabase directly.

## Local frontend setup

Run from the repository root:

```powershell
npm install
npm run dev
```

## Local backend setup

Run in a second PowerShell terminal from the repository root:

```powershell
cd api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Create `api/.env` before running live analysis:

```env
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Health check:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
```

Main backend endpoint:

```text
POST http://localhost:8000/api/analyze
```

## Supabase setup

Apply the table definition in:

```text
supabase/schema.sql
```

The backend saves records into the `haizier_analyses` table.

## Vercel deployment notes

The project includes `vercel.json` for a single-repository deployment with Vite frontend output and Python API routing.

In Vercel Project Settings, add environment variables for:

```env
VITE_API_BASE_URL=
ALPHA_VANTAGE_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not add secrets to source code. Do not commit local `.env` files.

Recommended Vercel build settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Validation commands

Run before committing:

```powershell
npm run build
python -m compileall api
```

## GitHub readiness checklist

- `.gitignore` excludes secrets and generated files.
- `.env.example` contains variable names only.
- React frontend calls the backend through `src/services/apiClient.ts`.
- Alpha Vantage and Supabase service-role access stay in the Python backend.
- Supabase persistence uses the `haizier_analyses` table.

## Disclaimer

Haizier is an educational MVP only. Outputs are not financial advice and should not be used as recommendations to buy or sell securities.
