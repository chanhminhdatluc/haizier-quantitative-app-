# Haizier Python Backend

This folder contains the FastAPI backend for Haizier. It keeps Alpha Vantage and Supabase service-role credentials server-side so they are never exposed in the React frontend.

## Local backend setup

Run these commands in PowerShell from the repository root.

### 1. Create and activate a virtual environment

```powershell
cd api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```powershell
pip install -r requirements.txt
```

### 3. Create `api/.env`

Create a local file named `api/.env`. Do not commit this file.

Required backend variables:

```env
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Optional local CORS override:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176
```

### 4. Run the backend on port 8000

```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

```text
GET  http://localhost:8000/api/health
POST http://localhost:8000/api/analyze
```

Health check:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "haizier-api"
}
```

## Security notes

- Do not commit `api/.env`.
- Do not expose `ALPHA_VANTAGE_API_KEY` in React/Vite code.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in React/Vite code.
- For deployment, store backend secrets in Vercel environment variables.
