# Quick Start Guide - EC2 Deployment

**Server**: `root@139.59.40.61`
**Password**: `xyz`

## Option 1: Fastest Method (5 minutes)

### Step 1: SSH into server
```bash
ssh root@139.59.40.61
# Enter password: Blue$shark@2025
```

### Step 2: Upload code from your local machine
Open a new terminal on your local machine:

```bash
cd /path/to/your/Test_Portal
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '.env' \
    ./ root@139.59.40.61:/opt/test-portal/
```

### Step 3: Run deployment script (back on server)
```bash
cd /opt/test-portal
chmod +x deploy.sh
sudo ./deploy.sh
```

The script will ask you for:
- MongoDB URI
- JWT Secret
- Domain name (or use IP: 139.59.40.61)
- Email for SSL

### Step 4: Access your application
```
HTTP:  http://139.59.40.61
HTTPS: https://yourdomain.com (if configured)
API:   http://139.59.40.61/api/health
```

## Option 2: Manual Commands

### Quick commands:
```bash
# 1. SSH into server
ssh root@139.59.40.61

# 2. Install Docker
curl -fsSL https://get.docker.com | sudo sh

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Setup firewall
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 5. Create app directory and upload code
mkdir -p /opt/test-portal
cd /opt/test-portal
# Upload your code here

# 6. Create .env file
nano .env
```

Add to .env:
```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
NODE_ENV=production
PORT=5000
DOMAIN=139.59.40.61
FRONTEND_URL=http://139.59.40.61
```

```bash
# 7. Create SSL directory and generate DH params
mkdir -p nginx/ssl
openssl dhparam -out nginx/ssl/dhparam.pem 2048

# 8. Create temporary SSL certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/privkey.pem \
    -out nginx/ssl/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=Org/CN=139.59.40.61"

# 9. Start the application
docker-compose build
docker-compose up -d

# 10. Check status
docker-compose ps
docker-compose logs -f
```

## Verify Deployment

```bash
# Check if containers are running
docker-compose ps

# Check backend health
curl http://localhost:5000/api/health

# Check from outside
curl http://139.59.40.61/api/health

# View logs
docker-compose logs -f
```

## Common Issues

### Issue: Port already in use
```bash
# Find what's using the port
sudo netstat -tulpn | grep :80
# Kill the process or stop the service
sudo systemctl stop apache2  # if Apache is running
```

### Issue: Cannot connect to MongoDB
```bash
# Check .env file
cat .env

# Test connection
docker-compose logs server
```

### Issue: Permission denied
```bash
# Make sure you're using sudo
sudo docker-compose up -d
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Check resource usage
docker stats
```

## Next Steps

1. **Configure DNS**: Point your domain to `139.59.40.61`
2. **Setup SSL**: Use Let's Encrypt for production SSL
3. **Update CORS**: Add your domain to server's allowed origins
4. **Monitor**: Setup monitoring and logging
5. **Backup**: Configure regular database backups

For detailed instructions, see `EC2_DEPLOYMENT_GUIDE.md`
