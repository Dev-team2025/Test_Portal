# Render Deployment Guide

## Issues Fixed

### 1. Mongoose Duplicate Index Warning ✅
**Problem**: Duplicate schema index on `{weekNumber:1, year:1}`

**Solution**: Removed duplicate index definition in `server/models/WeeklyCard.js`

### 2. Missing client/dist/index.html Error ✅
**Problem**: `/opt/render/project/src/client/dist/index.html` not found

**Solution**:
- Updated server.js to include helpful error messages
- Created build script to ensure client is built before server starts
- Added Render-specific build configuration

## Render Configuration

### Manual Setup in Render Dashboard

1. **Build Command**:
   ```bash
   cd server && npm run render-build
   ```

   OR use the simpler version:
   ```bash
   cd server && npm install && cd ../client && npm install && npm run build && cd ../server
   ```

2. **Start Command**:
   ```bash
   cd server && node server.js
   ```

3. **Root Directory**:
   - Leave as default (root of repository)

4. **Environment Variables** (Add in Render Dashboard):
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://admin:admin123@cluster0.utu9p26.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=Dlithe@123
   JWT_EXPIRATION=1h
   FRONTEND_URL=https://test-portal-srbl.onrender.com
   ```

### Using render.yaml (Alternative)

If you want to use Infrastructure as Code, commit the `render.yaml` file:

```yaml
services:
  - type: web
    name: test-portal
    env: node
    buildCommand: cd server && npm run render-build
    startCommand: cd server && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false  # Set in dashboard
      - key: JWT_SECRET
        sync: false  # Set in dashboard
```

## Deployment Steps

### Step 1: Update Your Code

Ensure all fixes are committed:
```bash
git add .
git commit -m "Fix Render deployment issues"
git push origin dev-branch
```

### Step 2: Configure Render

1. Go to your Render service: https://dashboard.render.com
2. Select your service: `test-portal-srbl`
3. Go to **Settings**
4. Update **Build Command**:
   ```
   cd server && npm install && cd ../client && npm install && npm run build && cd ../server
   ```
5. Update **Start Command**:
   ```
   cd server && node server.js
   ```

### Step 3: Set Environment Variables

In Render Dashboard → Environment:

| Key | Value |
|-----|-------|
| NODE_ENV | production |
| PORT | 10000 |
| MONGO_URI | (your MongoDB connection string) |
| JWT_SECRET | (your JWT secret) |
| JWT_EXPIRATION | 1h |
| FRONTEND_URL | https://test-portal-srbl.onrender.com |

### Step 4: Deploy

1. Go to **Manual Deploy** → **Deploy latest commit**
2. Or push to your branch and it will auto-deploy

### Step 5: Verify Deployment

Test these endpoints:

1. **Health Check**: https://test-portal-srbl.onrender.com/api/health
2. **Frontend**: https://test-portal-srbl.onrender.com
3. **Auth**: https://test-portal-srbl.onrender.com/api/auth/login

## Troubleshooting

### Issue: Client build not found

**Check logs for**:
```
Error: ENOENT: no such file or directory, stat '.../client/dist/index.html'
```

**Solutions**:
1. Verify build command runs: `cd client && npm run build`
2. Check that `client/dist` folder is created during build
3. Look for build errors in Render logs
4. Ensure vite builds correctly: check `client/package.json` build script

### Issue: CORS errors

**Symptoms**:
- Frontend can't connect to API
- Browser console shows CORS errors

**Solutions**:
1. Add your Render URL to `allowedOrigins` in `server/server.js`
2. Set `FRONTEND_URL` environment variable in Render
3. Check that CORS middleware is configured correctly

### Issue: MongoDB connection fails

**Check**:
1. MongoDB Atlas IP whitelist includes `0.0.0.0/0` (allow from anywhere)
2. `MONGO_URI` environment variable is set correctly in Render
3. Database user has correct permissions

### Issue: Build timeout

**Solutions**:
1. Use `npm ci` instead of `npm install` for faster installs
2. Check for large dependencies
3. Consider using Render's paid plans for faster builds

## Build Process Explanation

The build process works as follows:

1. **Server Dependencies**: `cd server && npm install`
2. **Client Dependencies**: `cd ../client && npm install`
3. **Build Client**: `npm run build` (creates `client/dist`)
4. **Start Server**: `cd ../server && node server.js`

The server serves the built client from `client/dist` for all non-API routes.

## Performance Optimization

### Enable Compression
Add to `server/server.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

### Cache Static Assets
Already configured via `express.static()` in server.js

### Database Indexing
Already configured in WeeklyCard model (fixed duplicate index)

## Monitoring

- **Logs**: View in Render Dashboard → Logs
- **Metrics**: Render Dashboard → Metrics
- **Health Check**: `/api/health` endpoint

## Next Steps

1. ✅ Fix MongoDB credentials (change from default password)
2. ✅ Add custom domain (optional)
3. ✅ Set up SSL/HTTPS (Render provides this automatically)
4. ✅ Monitor performance and logs
5. ✅ Set up automated backups for MongoDB

## Support

If deployment still fails:
1. Check Render logs for specific errors
2. Verify all environment variables are set
3. Test locally with production build: `npm run build && npm start`
4. Contact Render support if infrastructure issues persist
