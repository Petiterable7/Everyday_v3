# Deployment Guide: Frontend to Vercel, Backend to Render

## Overview

This guide will help you deploy your Everyday todo application with:
- **Frontend**: React app deployed to Vercel
- **Backend**: Express API + PostgreSQL database deployed to Render

## Prerequisites

1. A Vercel account
2. A Render account  
3. Your code pushed to a GitHub repository

## Step 1: Deploy Backend to Render

### Database Setup
1. Go to Render Dashboard
2. Create a new PostgreSQL database
   - Name: `everyday-db`
   - Plan: Free tier
   - Keep the connection details handy

### Backend Service Setup
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the `backend` folder as the root directory
4. Configure the service:
   - **Name**: `everyday-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Environment Variables
Set these environment variables in Render:

```
NODE_ENV=production
DATABASE_URL=[your-postgresql-connection-string-from-render]
SESSION_SECRET=[generate-a-random-string-32-chars]
FRONTEND_URL=https://[your-vercel-app-name].vercel.app
REPL_ID=[your-replit-id]
REPLIT_DOMAINS=[your-vercel-app-name].vercel.app
ISSUER_URL=https://replit.com/oidc
```

### Run Database Migration
After the backend deploys, run the database migration:
1. Go to your Render service
2. Open the Shell tab
3. Run: `npm run db:push`

## Step 2: Deploy Frontend to Vercel

### Frontend Setup
1. Go to Vercel Dashboard
2. Import your GitHub repository
3. Set the root directory to `frontend`
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Environment Variables
Set this environment variable in Vercel:

```
VITE_API_URL=https://[your-render-backend-url].onrender.com
```

### Deploy
1. Click Deploy
2. Wait for the build to complete
3. Your frontend should now be live!

## Step 3: Update Backend CORS Settings

After getting your Vercel URL:
1. Go back to Render backend service
2. Update the `FRONTEND_URL` environment variable with your actual Vercel URL
3. Update `REPLIT_DOMAINS` with your Vercel domain
4. Restart the backend service

## Step 4: Configure Replit Auth

1. Go to your Replit project
2. Update the OAuth redirect URLs to include your Vercel domain
3. Make sure the `REPL_ID` is correctly set in your backend environment

## Testing

1. Visit your Vercel frontend URL
2. Try logging in with Replit Auth
3. Test creating tasks and categories
4. Verify the calendar functionality works

## Troubleshooting

### CORS Issues
- Make sure `FRONTEND_URL` is set correctly in backend
- Check that the frontend is making requests to the correct API URL

### Database Issues  
- Verify `DATABASE_URL` is correct
- Make sure you ran `npm run db:push` on the backend

### Authentication Issues
- Check that `REPL_ID` and `REPLIT_DOMAINS` are correctly configured
- Verify OAuth redirect URLs in Replit settings

### Build Issues
- Make sure all dependencies are in the correct package.json files
- Check the build logs for specific error messages

## File Structure

```
project/
├── frontend/           # Deploy to Vercel
│   ├── client/
│   ├── shared/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
│
└── backend/           # Deploy to Render  
    ├── server/
    ├── shared/
    ├── package.json
    ├── drizzle.config.ts
    └── render.yaml
```

The code is now ready for separate deployment! Each part has its own package.json and is configured to work independently.