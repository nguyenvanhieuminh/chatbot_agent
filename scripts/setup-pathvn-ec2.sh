#!/bin/bash
set -e

echo "🚀 PathVN EC2 Setup Script"
echo "=========================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create app directory
echo -e "${BLUE}📁 Creating /opt/pathvn directory...${NC}"
sudo mkdir -p /opt/pathvn
cd /opt/pathvn

# Create docker-compose.yml
echo -e "${BLUE}📝 Creating docker-compose.yml...${NC}"
sudo tee docker-compose.yml > /dev/null <<'EOF'
version: '3.8'

services:
  pathvn:
    image: ghcr.io/nguyenvanhieuminh/chatbot_agent:latest
    container_name: pathvn-app
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  app-network:
    driver: bridge
EOF

echo -e "${GREEN}✅ docker-compose.yml created${NC}"

# Create data directory
echo -e "${BLUE}📁 Creating data directory...${NC}"
sudo mkdir -p data

# Login to GitHub Container Registry
echo ""
echo -e "${BLUE}🔐 GitHub Container Registry Login${NC}"
echo "Enter your GitHub username:"
read GITHUB_USERNAME

echo "Enter your GitHub Personal Access Token (PAT):"
echo "  Create at: https://github.com/settings/tokens"
echo "  Required scope: read:packages"
read -s GITHUB_TOKEN

echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
else
    echo "❌ Login failed. Please check credentials."
    exit 1
fi

# Pull and start the application
echo ""
echo -e "${BLUE}📦 Pulling Docker image...${NC}"
docker-compose pull

echo -e "${BLUE}🚀 Starting PathVN...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ PathVN Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📊 Check status:"
echo "   docker ps"
echo ""
echo "📝 View logs:"
echo "   docker logs pathvn-app -f"
echo ""
echo "🌐 Access PathVN at:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3001"
echo ""
