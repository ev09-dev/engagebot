#!/bin/bash

# EngageBot Deployment Script for Railway

set -e

echo "🚀 Starting EngageBot deployment to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Please login to Railway first:"
    echo "railway login"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test

# Build the application
echo "🔨 Building the application..."
npm run build

# Initialize Railway project if not already initialized
if [ ! -f "railway.toml" ]; then
    echo "📋 Initializing Railway project..."
    railway init
fi

# Link to Railway project
echo "🔗 Linking to Railway project..."
railway link

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is now live at: $(railway domain)"