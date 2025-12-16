# EC2 Deployment Guide - Test Portal

Complete guide to deploy your Test Portal application on EC2 Ubuntu with Docker, Nginx reverse proxy, and HTTPS.

## Prerequisites

- EC2 Ubuntu instance running
- SSH access to the server
- Domain name (optional but recommended for HTTPS)
- MongoDB connection string
- Server IP: `139.59.40.61`
- SSH credentials provided

## Deployment Architecture

```
Internet (HTTPS/HTTP)
        ↓
    Nginx (Port 443/80)
        ↓
    ┌─────────────────┐
    │  Reverse Proxy  │
    └─────────────────┘
         ↓         ↓
    Frontend    Backend
   (Port 3000) (Port 5000)
     Docker      Docker
```

## Quick Start (Automated Deployment)

### Option 1: Manual SSH Deployment

1. **SSH into your EC2 instance**:
```bash
ssh root@139.59.40.61
# Password: Blue$shark@2025
```

2. **Create application directory**:
```bash
mkdir -p /opt/test-portal
cd /opt/test-portal
```

3. **Upload your code** (from your local machine in a new terminal):
```bash
# Using SCP (from your local project directory)
scp -r ./* root@139.59.40.61:/opt/test-portal/

# Or using rsync (recommended)
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    ./ root@139.59.40.61:/opt/test-portal/
```

4. **Back on the EC2 server, run the deployment script**:
```bash
cd /opt/test-portal
chmod +x deploy.sh
sudo ./deploy.sh
```

The script will:
- Install Docker and Docker Compose
- Configure firewall (UFW)
- Set up SSL certificates
- Build and start your application
- Configure automatic SSL renewal

### Option 2: Automated Deployment from Local Machine

```bash
# From your local project directory
chmod +x setup-ec2.sh
./setup-ec2.sh
```

## Manual Step-by-Step Deployment

### Step 1: Prepare EC2 Server

```bash
# SSH into server
ssh root@139.59.40.61

# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install required packages
sudo apt-get install -y curl wget git nano vim ufw certbot python3-certbot-nginx
```

### Step 2: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
```

### Step 3: Install Docker Compose

```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### Step 4: Configure Firewall

```bash
# Enable UFW
sudo ufw --force enable

# Allow necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 5000/tcp # Backend (optional, for direct access)

# Check status
sudo ufw status
```

### Step 5: Setup Application

```bash
# Create application directory
sudo mkdir -p /opt/test-portal
cd /opt/test-portal

# Copy your code here (use scp, git clone, or rsync)
# Example with git:
# git clone <your-repo-url> .
```

### Step 6: Configure Environment Variables

Create `.env` file in the project root:

```bash
nano .env
```

Add the following:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/testportal?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-change-this

# Domain (replace with your domain)
DOMAIN=yourdomain.com
EMAIL=your-email@example.com

# Node Environment
NODE_ENV=production
PORT=5000

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 7: Generate SSL DH Parameters

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate DH parameters (this takes a few minutes)
sudo openssl dhparam -out nginx/ssl/dhparam.pem 2048
```

### Step 8: Create Temporary SSL Certificate

```bash
# Create self-signed certificate for initial setup
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/privkey.pem \
    -out nginx/ssl/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"
```

### Step 9: Build and Start Containers

```bash
# Build Docker images
sudo docker-compose build --no-cache

# Start containers
sudo docker-compose up -d

# Check status
sudo docker-compose ps

# View logs
sudo docker-compose logs -f
```

### Step 10: Setup Let's Encrypt SSL (Production)

**Important**: Make sure your domain DNS points to your EC2 IP address first!

```bash
# Stop nginx container
sudo docker-compose stop nginx

# Get SSL certificate
sudo certbot certonly --standalone \
    --preferred-challenges http \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d yourdomain.com

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
sudo chmod 644 nginx/ssl/*.pem

# Restart nginx
sudo docker-compose up -d nginx
```

### Step 11: Setup Automatic SSL Renewal

```bash
# Add cron job for certificate renewal
(sudo crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /opt/test-portal/nginx/ssl/ && docker-compose -f /opt/test-portal/docker-compose.yml restart nginx") | sudo crontab -
```

## Verification

### Check if services are running:

```bash
# Check Docker containers
sudo docker-compose ps

# Check logs
sudo docker-compose logs -f

# Check specific service
sudo docker-compose logs -f server
sudo docker-compose logs -f client
sudo docker-compose logs -f nginx
```

### Test the application:

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test from outside
curl http://139.59.40.61/api/health
curl https://yourdomain.com/api/health

# Check if frontend is accessible
curl http://139.59.40.61
curl https://yourdomain.com
```

## Useful Commands

### Docker Management

```bash
# View running containers
sudo docker-compose ps

# View logs
sudo docker-compose logs -f

# Restart services
sudo docker-compose restart

# Restart specific service
sudo docker-compose restart server

# Stop all services
sudo docker-compose down

# Rebuild and restart
sudo docker-compose up -d --build

# Remove all containers and volumes
sudo docker-compose down -v
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check Docker resource usage
sudo docker stats
```

### Nginx Management

```bash
# Check Nginx configuration
sudo docker-compose exec nginx nginx -t

# Reload Nginx configuration
sudo docker-compose exec nginx nginx -s reload

# View Nginx logs
sudo docker-compose logs nginx
tail -f nginx/logs/access.log
tail -f nginx/logs/error.log
```

## Troubleshooting

### Issue: Containers not starting

```bash
# Check logs for errors
sudo docker-compose logs

# Check if ports are already in use
sudo netstat -tulpn | grep -E '(80|443|3000|5000)'

# Rebuild containers
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

### Issue: SSL certificate not working

```bash
# Verify certificate files exist
ls -la nginx/ssl/

# Check if domain points to server
dig yourdomain.com

# Re-generate certificate
sudo certbot certonly --standalone -d yourdomain.com --force-renewal
sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem nginx/ssl/
sudo docker-compose restart nginx
```

### Issue: Cannot connect to MongoDB

```bash
# Check if MongoDB URI is correct in .env
cat .env | grep MONGODB_URI

# Test MongoDB connection from server
sudo docker-compose exec server node -e "require('./config/db')()"

# Check server logs
sudo docker-compose logs server
```

### Issue: Frontend cannot reach backend

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check Nginx proxy configuration
sudo docker-compose exec nginx cat /etc/nginx/conf.d/default.conf

# Check network connectivity
sudo docker network ls
sudo docker network inspect test-portal_test-portal-network
```

## Security Recommendations

1. **Change default passwords**: Never use default or weak passwords
2. **Use environment variables**: Never commit `.env` files to git
3. **Setup firewall**: Only allow necessary ports
4. **Regular updates**: Keep system and Docker images updated
5. **Monitor logs**: Regularly check application and system logs
6. **Backup data**: Regular backups of MongoDB database
7. **Use HTTPS only**: Force HTTPS in production

## Updating the Application

```bash
# Pull latest code
cd /opt/test-portal
git pull origin main

# Rebuild and restart
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d

# Or if not using git, upload new files and:
sudo docker-compose up -d --build
```

## Backup and Restore

### Backup MongoDB

```bash
# Backup MongoDB (if using local MongoDB)
sudo docker-compose exec server mongodump --uri="$MONGODB_URI" --out=/backup

# If using MongoDB Atlas, use Atlas backup features
```

### Backup Application Files

```bash
# Backup entire application
sudo tar -czf test-portal-backup-$(date +%Y%m%d).tar.gz /opt/test-portal

# Backup to remote location
scp test-portal-backup-*.tar.gz user@backup-server:/backups/
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-random-secret-key` |
| `DOMAIN` | Your domain name | `example.com` |
| `EMAIL` | Email for SSL certificates | `admin@example.com` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Backend server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://example.com` |

## Support

For issues or questions:
1. Check application logs: `sudo docker-compose logs -f`
2. Check system resources: `df -h`, `free -h`
3. Verify network connectivity
4. Check firewall rules: `sudo ufw status`
5. Review this documentation

## Architecture Details

### Ports
- **80**: HTTP (redirects to HTTPS)
- **443**: HTTPS (Nginx)
- **3000**: Frontend container (internal)
- **5000**: Backend container (internal)

### Docker Containers
1. **test-portal-nginx**: Reverse proxy with SSL
2. **test-portal-client**: React frontend
3. **test-portal-server**: Node.js backend

### Docker Network
- **test-portal-network**: Bridge network for inter-container communication

---

**Last Updated**: December 2024
**Version**: 1.0.0
