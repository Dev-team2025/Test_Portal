# Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

#### Server Environment Variables
Create a `server/.env` file with the following variables:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourAppName

# JWT Configuration
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRATION=1h

# Environment
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=http://your-frontend-domain.com
```

#### Client Environment Variables
Create a `client/.env` file with:

```env
VITE_API_BASE_URL=http://your-backend-domain.com:5000
```

### 2. Security Checklist

- [x] `.gitignore` file created to exclude sensitive files
- [x] `.env` files removed from Git tracking
- [x] `.env.example` templates created for reference
- [ ] Change MongoDB credentials from default `admin/admin123`
- [ ] Generate strong JWT secret (recommended: 32+ characters)
- [x] CORS configured for production domains
- [ ] Add your production domain to `allowedOrigins` in server.js

### 3. Database Setup

1. Ensure MongoDB Atlas cluster is accessible
2. Update `MONGO_URI` with production credentials
3. Whitelist deployment server IP in MongoDB Atlas

### 4. Build Process

#### Client Build
```bash
cd client
npm install
npm run build
```

The build output will be in `client/dist/`

#### Server Dependencies
```bash
cd server
npm install
```

### 5. Deployment Steps

#### Option A: Single Server Deployment (Current Setup)

The server is configured to serve the React app from `client/dist`:

1. Build the client application
2. Copy built files to `client/dist`
3. Start the server:
   ```bash
   cd server
   NODE_ENV=production node server.js
   ```

#### Option B: Separate Frontend/Backend Deployment

If deploying separately:

1. **Backend**: Deploy server to your hosting (e.g., DigitalOcean: 157.245.111.79)
2. **Frontend**: Deploy client to hosting service (Vercel, Netlify, etc.)
3. Update environment variables accordingly

### 6. Post-Deployment Verification

Test the following endpoints:

1. **Health Check**: `GET http://your-domain:5000/api/health`
2. **Authentication**: `POST http://your-domain:5000/api/auth/login`
3. **Questions**: `GET http://your-domain:5000/api/questions/active-card-info`

### 7. Production Optimizations

- [ ] Enable HTTPS/SSL certificates
- [ ] Set up process manager (PM2) for server
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable compression middleware
- [ ] Set up logging and monitoring
- [ ] Configure automated backups for MongoDB

### 8. Common Issues

#### CORS Errors
- Verify `FRONTEND_URL` in server `.env`
- Check `allowedOrigins` array in `server/server.js`
- Ensure protocol (http/https) matches

#### Environment Variables Not Loading
- Verify `.env` file location (must be in `server/` directory)
- Check file encoding (should be UTF-8)
- Restart server after changes

#### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear vite cache: `rm -rf client/.vite`

## Using PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start server
cd server
pm2 start server.js --name "quiz-portal"

# Enable auto-restart on server reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs quiz-portal
```

## Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Support

For issues or questions, refer to the server logs in `server/logs/combined.log`
