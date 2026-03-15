#!/bin/bash

# BioCycle - Vercel Deployment Script
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  BioCycle - Vercel Deployment Script${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Get deployment choice
echo -e "${YELLOW}What do you want to deploy?${NC}"
echo "1) Backend only"
echo "2) Frontend only"
echo "3) Both (backend first, then frontend)"
read -p "Choose option (1-3): " deploy_choice

# Backend deployment
deploy_backend() {
    echo -e "\n${YELLOW}Deploying backend...${NC}\n"
    cd backend
    
    # Check if .env file exists
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}ERROR: .env.production file not found in backend/!${NC}"
        echo "Please create backend/.env.production with your environment variables"
        echo "Reference: backend/.env.production (template provided)"
        return 1
    fi
    
    echo -e "${GREEN}✓ Environment file found${NC}"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    echo -e "${GREEN}✓ Backend deployment complete${NC}"
    cd ..
}

# Frontend deployment
deploy_frontend() {
    echo -e "\n${YELLOW}Deploying frontend...${NC}\n"
    cd frontend
    
    # Check if .env file exists
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}ERROR: .env.production file not found in frontend/!${NC}"
        echo "Please create frontend/.env.production with:"
        echo "VITE_API_BASE_URL=https://your-backend.vercel.app/api"
        return 1
    fi
    
    echo -e "${GREEN}✓ Environment file found${NC}"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
    
    # Build for production
    echo -e "${YELLOW}Building for production...${NC}"
    npm run build
    
    # Deploy to Vercel
    vercel --prod
    
    echo -e "${GREEN}✓ Frontend deployment complete${NC}"
    cd ..
}

# Execute deployment based on choice
case $deploy_choice in
    1)
        deploy_backend
        ;;
    2)
        deploy_frontend
        ;;
    3)
        deploy_backend && deploy_frontend
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Post-Deployment Checklist:${NC}"
echo "1. Test backend health endpoint"
echo "2. Test login flow in frontend"
echo "3. Verify API calls are working"
echo "4. Check response times (target: < 500ms)"
echo "5. Run database optimization script"
echo "6. Monitor Vercel logs for errors"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "• View backend logs: vercel logs <backend-url>"
echo "• View frontend logs: vercel logs <frontend-url>"
echo "• Rollback deployment: vercel rollback"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}\n"
