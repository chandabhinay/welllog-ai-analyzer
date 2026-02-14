#!/bin/bash

# Quick Start Script for macOS/Linux
# Well Log Analysis System Setup

echo "========================================"
echo "Well Log Analysis System - Quick Start"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install from https://nodejs.org/${NC}"
    exit 1
fi

# Check PostgreSQL
echo -e "${YELLOW}Checking PostgreSQL installation...${NC}"
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo -e "${GREEN}✓ PostgreSQL installed: $PG_VERSION${NC}"
else
    echo -e "${RED}✗ PostgreSQL not found. Please install PostgreSQL${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo "Setting up Backend"
echo "========================================"

# Backend setup
cd backend

echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠ IMPORTANT: Please edit backend/.env with your credentials!${NC}"
    echo -e "${YELLOW}  - Database password${NC}"
    echo -e "${YELLOW}  - AWS S3 credentials${NC}"
    echo -e "${YELLOW}  - OpenAI API key${NC}"
    echo ""
    read -p "Press Enter after editing .env file"
fi

echo ""
echo -e "${YELLOW}Initializing database...${NC}"
echo -e "${YELLOW}(Make sure PostgreSQL is running and you've created the database)${NC}"
echo ""

read -p "Initialize database now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run init-db
fi

cd ..

echo ""
echo "========================================"
echo "Setting up Frontend"
echo "========================================"

# Frontend setup
cd frontend

echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

cd ..

echo ""
echo -e "${GREEN}========================================"
echo "Setup Complete!"
echo "========================================${NC}"
echo ""
echo -e "${CYAN}To start the application:${NC}"
echo ""
echo -e "${YELLOW}1. Start backend (in one terminal):${NC}"
echo -e "   cd backend"
echo -e "   npm run dev"
echo ""
echo -e "${YELLOW}2. Start frontend (in another terminal):${NC}"
echo -e "   cd frontend"
echo -e "   npm run dev"
echo ""
echo -e "${YELLOW}3. Open browser to: http://localhost:5173${NC}"
echo ""
echo -e "${CYAN}For detailed setup instructions, see SETUP_GUIDE.md${NC}"
echo ""

read -p "Start servers now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Starting servers...${NC}"
    
    # Start backend in background
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait a bit for backend to start
    sleep 3
    
    # Start frontend
    cd frontend
    npm run dev
    
    # Cleanup on exit
    trap "kill $BACKEND_PID" EXIT
fi
