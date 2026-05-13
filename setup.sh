#!/bin/bash

echo "╔════════════════════════════════════════════╗"
echo "║  AI Question Solver - Quick Start Setup    ║"
echo "╚════════════════════════════════════════════╝"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Backend setup
echo -e "\n${YELLOW}Setting up Backend...${NC}"
cd backend

if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠ Please add your ANTHROPIC_API_KEY to backend/.env${NC}"
fi

echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend setup complete${NC}"
else
    echo -e "${RED}✗ Backend setup failed${NC}"
    exit 1
fi

# Frontend setup
echo -e "\n${YELLOW}Setting up Frontend...${NC}"
cd ../frontend

echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend setup complete${NC}"
else
    echo -e "${RED}✗ Frontend setup failed${NC}"
    exit 1
fi

cd ..

echo -e "\n${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Setup Complete! 🎉${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Add your ANTHROPIC_API_KEY to backend/.env"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend (new terminal): cd frontend && npm start"
echo "4. Open http://localhost:3000"
echo ""
echo -e "${YELLOW}Happy learning! 📚✨${NC}"
