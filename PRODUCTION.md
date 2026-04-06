# Production Deployment Guide

## Overview

ChatFree is now production-ready with database integration, authentication, logging, and security hardening. This guide covers deployment on various platforms.

## Pre-Deployment Checklist

- [ ] Environment variables configured for production
- [ ] MongoDB setup (local or cloud)
- [ ] Ollama running (or accessible remote instance)
- [ ] JWT secret changed from default
- [ ] CORS origins configured
- [ ] Security headers verified (Helmet)
- [ ] Rate limiting configured
- [ ] Logs directory exists
- [ ] SSL/TLS certificate obtained (for HTTPS)
- [ ] Database backups automated

## Local Development with Docker

### Quick Start

```bash
# Clone repository
git clone <your-repo>
cd CHATFREE

# Create .env file with MongoDB password
echo "MONGO_PASSWORD=your-secure-password" > .env

# Start all services
docker-compose up -d

# Initialize a model in Ollama (first time only)
docker exec chatfree-ollama ollama pull llama2

# Check services
docker-compose ps
```

### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MongoDB**: mongodb://admin:password@localhost:27017
- **Ollama**: http://localhost:11434

### Stop Services

```bash
docker-compose down

# Remove volumes (careful - deletes data!)
docker-compose down -v
```

## Heroku Deployment (Backend)

### Prerequisites

```bash
npm install -g heroku
heroku login
```

### Create Heroku App

```bash
cd backend
heroku create chatfree-api
heroku addons:create mongolab:sandbox  # or use MongoDB Atlas
heroku config:set JWT_SECRET=your-production-secret
heroku config:set OLLAMA_API_URL=your-ollama-url  # Use managed Ollama or external
heroku config:set NODE_ENV=production
```

### Deploy

```bash
git push heroku main
heroku logs --tail
```

### Connect Frontend

Update frontend `.env`:
```env
REACT_APP_API_URL=https://chatfree-api.herokuapp.com/api
```

## AWS Deployment

### EC2 + RDS Setup

1. **Launch EC2 Instance** (Ubuntu 22.04)
   ```bash
   # Connect to instance
   ssh -i your-key.pem ubuntu@your-instance.com

   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install MongoDB client
   sudo apt install -y mongodb-mongosh

   # Install Ollama
   curl https://ollama.ai/install.sh | sh
   ```

2. **Setup RDS** (MongoDB-compatible)
   - Create RDS instance with MongoDB engine
   - Update MONGODB_URI in .env

3. **Deploy Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "chatfree-api" -- start
   pm2 startup
   pm2 save
   ```

### Vercel Deployment (Frontend)

1. Connect GitHub repository to Vercel
2. Add environment variable:
   ```
   REACT_APP_API_URL=your-backend-url/api
   ```
3. Deploy automatically on push

## Docker Swarm Deployment

```bash
# Initialize Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml chatfree

# Check services
docker service ls
docker service logs chatfree_backend

# Scale backend
docker service scale chatfree_backend=3

# Remove stack
docker stack rm chatfree
```

## Kubernetes Deployment

### Prerequisites

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Create persistent volumes
kubectl apply -f k8s/storage.yaml

# Deploy services
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

# Check status
kubectl get pods -n chatfree
kubectl logs -n chatfree deployment/backend
```

## Nginx Reverse Proxy Setup

```nginx
upstream backend {
  server localhost:3001;
  server localhost:3001; # for load balancing
}

upstream frontend {
  server localhost:3000;
}

server {
  listen 80;
  server_name example.com;

  # Frontend
  location / {
    proxy_pass http://frontend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # API
  location /api/ {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_timeout 30s;
    proxy_read_timeout 30s;
  }

  # SSL redirect
  if ($scheme != "https") {
    return 301 https://$server_name$request_uri;
  }
}
```

## SSL/TLS Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Monitoring & Logging

### Real-Time Logs

```bash
# Backend
pm2 logs chatfree-api

# Docker
docker logs -f chatfree-backend

# Kubernetes
kubectl logs -f deployment/backend -n chatfree
```

### Log Aggregation (ELK Stack - Optional)

```yaml
# docker-compose.yml addition
elasticsearch:
  image: elasticsearch:7.13.0
  environment:
    discovery.type: single-node

logstash:
  image: logstash:7.13.0
  depends_on:
    - elasticsearch

kibana:
  image: kibana:7.13.0
  ports:
    - "5601:5601"
```

## Database Backups

### MongoDB Local Backup

```bash
# Backup
mongodump --uri="mongodb://admin:password@localhost:27017/chatfree?authSource=admin" --out=./backups

# Restore
mongorestore --uri="mongodb://admin:password@localhost:27017/chatfree?authSource=admin" ./backups
```

### Automated Backups (Cron)

```bash
# /usr/local/bin/backup-mongodb.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out=/backups/mongodb-$DATE
find /backups -name "mongodb-*" -mtime +7 -exec rm -rf {} \;
```

Add to crontab:
```bash
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

## Performance Optimization

### Enable Caching

```javascript
// backend/middleware/caching.js
const redis = require('redis');
const client = redis.createClient();

const cache = (duration = 60) => {
  return (req, res, next) => {
    const key = `${req.method}:${req.path}`;
    client.get(key, (err, data) => {
      if (data) return res.json(JSON.parse(data));
      res.sendJSON = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        return res.sendJSON(body);
      };
      next();
    });
  };
};
```

### Load Balancing

```bash
# HAProxy config
global
  maxconn 4096

frontend http_in
  bind *:80
  default_backend backend_servers

backend backend_servers
  balance roundrobin
  server srv1 localhost:3001
  server srv2 localhost:3002
  server srv3 localhost:3003
```

## Security Hardening

### Additional Security Headers

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
```

### Database Credentials

```bash
# Use environment-specific .env files
.env.development   # Local development
.env.production    # Production secrets
.env.staging       # Staging environment

# Never commit .env files
echo ".env*" >> .gitignore
```

### Monitoring & Alerts

Set up tools like:
- **New Relic** - Performance monitoring
- **Sentry** - Error tracking
- **DataDog** - Infrastructure monitoring
- **CloudWatch** - AWS monitoring

## Rollback Procedures

### Docker

```bash
docker service rollback chatfree_backend
```

### Git

```bash
git revert <commit-hash>
git push origin main
```

### Database

```bash
# Restore from backup
mongorestore --uri="$MONGODB_URI" /backups/mongodb-latest
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker logs chatfree-backend
pm2 logs chatfree-api

# Verify MongoDB connection
mongosh "mongodb://user:pass@host:27017/chatfree"
```

### Out of memory
```bash
# Increase Node.js heap
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

### Slow API responses
```bash
# Check database indexes
db.conversations.getIndexes()

# Monitor connections
db.serverStatus().connections
```

## Scaling Strategy

1. **Vertical Scaling**: Increase server resources
2. **Horizontal Scaling**: Add more application instances
3. **Database Sharding**: Split data across databases
4. **Caching**: Redis for frequently accessed data
5. **CDN**: CloudFlare for static assets

## Support & Monitoring

- Set up health check endpoints
- Monitor error rates and latency
- Automated alerts for failures
- Regular security audits
- Load testing before release

---

For questions or issues, consult README.md and CONFIG.md
