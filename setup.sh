#!/bin/bash

# GetPhone.xyz Setup Script
# This script helps set up the full-stack application for the first time

set -e

echo "🚀 GetPhone.xyz Full Stack Setup"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create environment files if they don't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env file from template..."
    cp server/.env.example server/.env
    echo "✅ Created server/.env file"
else
    echo "✅ server/.env file already exists"
fi

echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "🗄️  Running database migrations..."
docker-compose exec -T backend npm run migrate

echo ""
echo "🌱 Seeding database with initial data..."
docker-compose exec -T backend node dist/config/seed.js

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Service URLs:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API: http://localhost:3001"
echo "  - Health Check: http://localhost:3001/health"
echo ""
echo "🔧 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - View backend logs: docker-compose logs -f backend"
echo ""
echo "🎉 Happy coding!"
