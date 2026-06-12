# Deployment

This project is split into two deployable apps:

- Backend API: FastAPI, deploy from the repository root with Docker.
- Frontend: Next.js, deploy from the `frontend/` directory.

## 1. Deploy Backend On Render

1. Push this repository to GitHub.
2. In Render, create a new **Blueprint** from the repository.
3. Render will use `render.yaml` and the root `Dockerfile`.
4. Set this environment variable in the Render service:

```bash
CORS_ORIGINS=http://localhost:3000
```

5. Deploy the service.
6. Open the deployed backend URL and check:

```text
https://your-render-service.onrender.com/health
```

It should return:

```json
{"status":"ok"}
```

## 2. Deploy Frontend On Vercel

1. In Vercel, import the same GitHub repository.
2. Set the project root directory to:

```text
frontend
```

3. Add this environment variable:

```bash
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com
```

4. Deploy the frontend.

## 3. Update Backend CORS

After Vercel gives you the frontend URL, update the Render backend environment variable:

```bash
CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000,http://127.0.0.1:3000
```

Redeploy the Render service after changing `CORS_ORIGINS`.

## Local Production Checks

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
