# Nimble Deploy - Docker Deployment Guide

This guide explains how to deploy Nimble Deploy using Docker and Docker Compose for production or development environments.

## Prerequisites

- Docker 20.0+ and Docker Compose 2.0+
- A Replit OAuth application configured for your domain
- Basic understanding of environment variables and Docker

## Quick Start

1. **Clone and prepare the environment:**
   ```bash
   git clone <your-repo>
   cd nimble-deploy
   chmod +x deploy.sh
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your actual values
   ```

3. **Deploy the application:**
   ```bash
   ./deploy.sh basic
   ```

## Environment Configuration

### Required Variables

Edit your `.env` file with these required values:

```env
# Authentication (Get from Replit OAuth app)
SESSION_SECRET=your_super_secure_session_secret_at_least_32_characters_long
REPL_ID=your_replit_app_id
REPLIT_DOMAINS=your-domain.com,localhost:3000

# Database
POSTGRES_PASSWORD=your_secure_postgres_password
```

### Optional Variables

```env
# Ports
APP_PORT=3000
POSTGRES_PORT=5432
NGINX_PORT=80
REDIS_PORT=6379

# Advanced
NODE_ENV=production
ISSUER_URL=https://replit.com/oidc
```

## Deployment Options

### Basic Deployment (Recommended)
```bash
./deploy.sh basic
```
- Nimble Deploy application
- PostgreSQL database
- Perfect for most use cases

### With Redis Session Storage
```bash
./deploy.sh redis
```
- Adds Redis for session storage
- Better performance for high-traffic sites

### With Nginx Reverse Proxy
```bash
./deploy.sh nginx
```
- Adds Nginx for load balancing and caching
- Includes rate limiting and security headers
- Production-ready setup

### Full Deployment
```bash
./deploy.sh full
```
- All services: App + PostgreSQL + Redis + Nginx
- Maximum performance and security

## Manual Docker Commands

If you prefer manual control:

```bash
# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec app npm run db:push

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Service Management

### Check Service Status
```bash
docker-compose ps
```

### View Application Logs
```bash
./deploy.sh logs
# or
docker-compose logs -f app
```

### Stop Services
```bash
./deploy.sh stop
```

### Clean Reset (Remove all data)
```bash
./deploy.sh clean
```

## Directory Structure

```
nimble-deploy/
├── Dockerfile              # Application container definition
├── docker-compose.yml      # Service orchestration
├── nginx.conf             # Nginx configuration
├── init-db.sql            # Database initialization
├── deploy.sh              # Deployment script
├── .env.example           # Environment template
└── README-Docker.md       # This file
```

## Production Considerations

### Security

1. **Change default passwords** in `.env`
2. **Use strong SESSION_SECRET** (32+ characters)
3. **Configure proper domain** in REPLIT_DOMAINS
4. **Enable SSL** in nginx.conf if using HTTPS

### Performance

1. **Use nginx profile** for production loads
2. **Configure Redis** for session storage in high-traffic scenarios
3. **Set appropriate resource limits** in docker-compose.yml

### Backup

1. **Database backup:**
   ```bash
   docker-compose exec db pg_dump -U nimble_user nimble_deploy > backup.sql
   ```

2. **Restore database:**
   ```bash
   docker-compose exec -T db psql -U nimble_user nimble_deploy < backup.sql
   ```

## Troubleshooting

### Common Issues

1. **"Session secret not provided" error:**
   - Ensure SESSION_SECRET is set in .env

2. **OAuth redirect errors:**
   - Verify REPLIT_DOMAINS matches your actual domain
   - Check REPL_ID is correct

3. **Database connection errors:**
   - Wait for database to fully start (30-60 seconds)
   - Check POSTGRES_PASSWORD matches

4. **Port conflicts:**
   - Change APP_PORT, POSTGRES_PORT in .env
   - Ensure ports aren't used by other services

### Debugging

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs app
docker-compose logs db

# Access application container
docker-compose exec app sh

# Access database
docker-compose exec db psql -U nimble_user nimble_deploy
```

## Health Checks

The deployment includes health checks for all services:

- **Application:** `http://localhost:3000/api/health`
- **Database:** PostgreSQL connection test
- **Redis:** Redis ping test
- **Nginx:** HTTP response test

## Scaling

To run multiple application instances:

```bash
docker-compose up -d --scale app=3
```

Note: Use nginx profile for proper load balancing when scaling.

## Support

For deployment issues:

1. Check logs: `./deploy.sh logs`
2. Verify environment variables in `.env`
3. Ensure all required OAuth settings are configured
4. Check Docker and Docker Compose versions

The application will be available at `http://localhost:3000` (or your configured port) once deployment is complete.