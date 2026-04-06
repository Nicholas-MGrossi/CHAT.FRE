#!/bin/bash

# ChatFree Quick Start Script
# This script helps set up and run ChatFree

echo "🚀 ChatFree Quick Start"
echo "====================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js v16+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check for Ollama
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama is not in PATH."
    echo "Please ensure Ollama is installed and running."
    echo "Download from: https://ollama.ai/"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verify Ollama is running
echo ""
echo "⏳ Checking Ollama connection..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running!"
else
    echo "⚠️  Ollama appears to not be running."
    echo "Please start Ollama with: ollama serve"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install and start backend
echo ""
echo "📦 Setting up backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "✅ Backend ready"

# Install and prepare frontend
echo ""
echo "📦 Setting up frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "✅ Frontend ready"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend:"
echo "   cd backend && npm start"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy chatting! 💬"
