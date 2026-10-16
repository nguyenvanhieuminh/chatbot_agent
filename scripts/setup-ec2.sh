#!/bin/bash
# Script tự động setup EC2 instance cho FastAPI Chatbot
# Usage: bash setup-ec2.sh

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 FastAPI Chatbot - EC2 Setup Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Cannot detect OS"
    exit 1
fi

echo "Detected OS: $OS"
echo ""

# Update system
echo "📦 Step 1: Updating system..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt update && sudo apt upgrade -y
elif [ "$OS" = "amzn" ] || [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    sudo yum update -y
else
    echo "Unsupported OS: $OS"
    exit 1
fi
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Install Docker
echo "🐳 Step 2: Installing Docker..."
if ! command -v docker &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        rm get-docker.sh
        sudo usermod -aG docker $USER
    elif [ "$OS" = "amzn" ]; then
        sudo yum install docker -y
        sudo usermod -aG docker ec2-user
    fi
    sudo systemctl start docker
    sudo systemctl enable docker
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${YELLOW}⚠ Docker already installed${NC}"
fi
docker --version
echo ""

# Install Docker Compose
echo "🔧 Step 3: Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${YELLOW}⚠ Docker Compose already installed${NC}"
fi
docker-compose --version
echo ""

# Install other tools
echo "🛠️  Step 4: Installing additional tools..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt install -y curl git nano htop
elif [ "$OS" = "amzn" ]; then
    sudo yum install -y curl git nano htop
fi
echo -e "${GREEN}✓ Additional tools installed${NC}"
echo ""

# Create app directory
echo "📁 Step 5: Creating application directory..."
sudo mkdir -p /opt/fastapi-chatbot
sudo chown $USER:$USER /opt/fastapi-chatbot
echo -e "${GREEN}✓ Directory created: /opt/fastapi-chatbot${NC}"
echo ""

# Prompt for GitHub info
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 GitHub Container Registry Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter your GitHub repository name: " GITHUB_REPO
read -sp "Enter your GitHub Personal Access Token (with read:packages scope): " GITHUB_PAT
echo ""

# Login to GitHub Container Registry
echo ""
echo "🔑 Step 6: Authenticating with GitHub Container Registry..."
echo "$GITHUB_PAT" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin
echo -e "${GREEN}✓ Authenticated with ghcr.io${NC}"
echo ""

# Create docker-compose.yml
echo "📝 Step 7: Creating docker-compose.yml..."
cat > /opt/fastapi-chatbot/docker-compose.yml << EOF
version: '3.8'

services:
  web:
    image: ghcr.io/${GITHUB_USERNAME}/${GITHUB_REPO}:latest
    container_name: fastapi-chatbot
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  default:
    name: chatbot-network
EOF
echo -e "${GREEN}✓ docker-compose.yml created${NC}"
echo ""

# Pull and start the app
echo "🚀 Step 8: Pulling and starting the application..."
cd /opt/fastapi-chatbot

if docker pull ghcr.io/${GITHUB_USERNAME}/${GITHUB_REPO}:latest; then
    echo -e "${GREEN}✓ Image pulled successfully${NC}"
    echo ""

    echo "Starting containers..."
    docker-compose up -d

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ Setup Complete!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 Application Status:"
    docker-compose ps
    echo ""
    echo "🌐 Access your application at:"
    echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs:       docker-compose logs -f"
    echo "   Stop app:        docker-compose down"
    echo "   Restart app:     docker-compose restart"
    echo "   Update app:      docker-compose pull && docker-compose up -d"
    echo ""
    echo "📖 Full documentation: docs/AWS-EC2-DEPLOY.md"
    echo ""
else
    echo -e "${RED}✗ Failed to pull image${NC}"
    echo ""
    echo "Possible reasons:"
    echo "  1. Image doesn't exist yet (run GitHub Actions to build it)"
    echo "  2. Wrong GitHub username/repo"
    echo "  3. PAT doesn't have read:packages permission"
    echo ""
    echo "You can manually pull later with:"
    echo "  docker-compose pull"
    echo "  docker-compose up -d"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  IMPORTANT: Don't forget to configure Security Groups!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Add these inbound rules in AWS Console:"
echo "  - Port 22 (SSH) from your IP"
echo "  - Port 8000 (App) from 0.0.0.0/0"
echo "  - Port 80 (HTTP) from 0.0.0.0/0 (if using Nginx)"
echo ""
