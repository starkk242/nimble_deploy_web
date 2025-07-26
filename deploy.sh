#!/bin/bash

# Nimble Deploy - Deployment Script
# This script helps deploy Nimble Deploy using Docker Compose

set -e

echo "🚀 Nimble Deploy - Deployment Script"
echo "====================================="

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before running this script again."
    echo "   Required variables: SESSION_SECRET, REPL_ID, REPLIT_DOMAINS"
    exit 1
fi

# Validate required environment variables
source .env

required_vars=("SESSION_SECRET" "REPL_ID" "REPLIT_DOMAINS")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo "Please update your .env file with these variables."
    exit 1
fi

# Function to deploy with different profiles
deploy() {
    local profile=${1:-""}
    local compose_args=""
    
    if [ -n "$profile" ]; then
        compose_args="--profile $profile"
    fi
    
    echo "🏗️  Building application..."
    docker-compose build
    
    echo "🗄️  Starting services..."
    docker-compose up -d $compose_args
    
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    
    echo "🔄 Running database migrations..."
    docker-compose exec app npm run db:push
    
    echo "✅ Deployment complete!"
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    echo ""
    echo "🌐 Application should be available at:"
    echo "   - http://localhost:${APP_PORT:-3000}"
    
    if [ "$profile" = "nginx" ]; then
        echo "   - http://localhost:${NGINX_PORT:-80} (via Nginx)"
    fi
}

# Parse command line arguments
case "${1:-basic}" in
    "basic")
        echo "🎯 Deploying basic setup (App + Database)..."
        deploy
        ;;
    "redis")
        echo "🎯 Deploying with Redis session storage..."
        deploy "redis"
        ;;
    "nginx")
        echo "🎯 Deploying with Nginx reverse proxy..."
        deploy "nginx"
        ;;
    "full")
        echo "🎯 Deploying full setup (App + Database + Redis + Nginx)..."
        deploy "redis,nginx"
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        docker-compose down
        ;;
    "clean")
        echo "🧹 Cleaning up (removing containers and volumes)..."
        docker-compose down -v
        docker system prune -f
        ;;
    "logs")
        echo "📋 Showing application logs..."
        docker-compose logs -f app
        ;;
    *)
        echo "Usage: $0 [basic|redis|nginx|full|stop|clean|logs]"
        echo ""
        echo "Commands:"
        echo "  basic  - Deploy app with PostgreSQL (default)"
        echo "  redis  - Deploy with Redis for session storage"
        echo "  nginx  - Deploy with Nginx reverse proxy"
        echo "  full   - Deploy with all services"
        echo "  stop   - Stop all services"
        echo "  clean  - Stop and remove all containers and volumes"
        echo "  logs   - Show application logs"
        exit 1
        ;;
esac