# 🚀 Deploy FastAPI Chatbot lên AWS EC2

Hướng dẫn deploy ứng dụng từ GitHub Actions lên EC2 instance.

## 📋 Prerequisites

- ✅ EC2 instance đang chạy (Ubuntu/Amazon Linux)
- ✅ GitHub repository với code
- ✅ SSH key để connect EC2

## 🔧 BƯỚC 1: Setup EC2 Instance

### 1.1. Connect vào EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
# hoặc
ssh -i your-key.pem ec2-user@your-ec2-ip  # Amazon Linux
```

### 1.2. Update System

```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y

# Amazon Linux
sudo yum update -y
```

### 1.3. Install Docker

**Ubuntu:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify
docker --version
```

**Amazon Linux 2:**
```bash
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
docker --version
```

### 1.4. Install Docker Compose

```bash
# Download latest version
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

### 1.5. Tạo thư mục cho app

```bash
# Tạo thư mục
sudo mkdir -p /opt/fastapi-chatbot
sudo chown $USER:$USER /opt/fastapi-chatbot
cd /opt/fastapi-chatbot

# Tạo docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  web:
    image: ghcr.io/YOUR_GITHUB_USERNAME/YOUR_REPO:latest
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

# QUAN TRỌNG: Thay YOUR_GITHUB_USERNAME/YOUR_REPO bằng repo thật của bạn!
```

### 1.6. Setup GitHub Container Registry Authentication

```bash
# Tạo GitHub Personal Access Token (PAT)
# GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
# Scopes: read:packages

# Login to GitHub Container Registry
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Test pull image
docker pull ghcr.io/YOUR_GITHUB_USERNAME/YOUR_REPO:latest
```

### 1.7. Test chạy app

```bash
cd /opt/fastapi-chatbot
docker-compose up -d

# Check logs
docker-compose logs -f

# Check health
curl http://localhost:8000/api/health

# Stop
docker-compose down
```

## 🔐 BƯỚC 2: Configure Security Groups (AWS Console)

### 2.1. Inbound Rules

Vào EC2 → Security Groups → Edit inbound rules:

```
Type            Protocol    Port    Source          Description
SSH             TCP         22      Your IP         SSH access
Custom TCP      TCP         8000    0.0.0.0/0       FastAPI app
HTTP            TCP         80      0.0.0.0/0       HTTP (if using Nginx)
HTTPS           TCP         443     0.0.0.0/0       HTTPS (if using Nginx)
```

### 2.2. Test từ browser

```
http://YOUR_EC2_PUBLIC_IP:8000
```

## 🔑 BƯỚC 3: Setup GitHub Secrets

### 3.1. Lấy SSH Private Key

```bash
# Trên máy local (nơi có file .pem)
cat your-key.pem

# Copy toàn bộ nội dung (bao gồm BEGIN và END)
```

### 3.2. Add vào GitHub Secrets

Vào repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

```
Name: SERVER_HOST
Secret: YOUR_EC2_PUBLIC_IP
---
Name: SERVER_USER
Secret: ubuntu  (hoặc ec2-user nếu dùng Amazon Linux)
---
Name: SERVER_SSH_KEY
Secret: (paste toàn bộ nội dung file .pem)
```

## 🚀 BƯỚC 4: Update Deployment Script

Workflow đã có sẵn trong `.github/workflows/ci-cd.yml`.

Verify deploy job:

```yaml
deploy:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'

  steps:
  - name: Checkout code
    uses: actions/checkout@v4

  - name: Deploy to server via SSH
    uses: appleboy/ssh-action@master
    with:
      host: ${{ secrets.SERVER_HOST }}
      username: ${{ secrets.SERVER_USER }}
      key: ${{ secrets.SERVER_SSH_KEY }}
      script: |
        cd /opt/fastapi-chatbot
        docker-compose pull
        docker-compose up -d --force-recreate
        docker image prune -f
```

## 🧪 BƯỚC 5: Test Deployment

### 5.1. Push code lên GitHub

```bash
git add .
git commit -m "Configure deployment to EC2"
git push origin main
```

### 5.2. Monitor GitHub Actions

- Vào repository → **Actions** tab
- Xem workflow **CI/CD Pipeline** chạy
- Check deploy step

### 5.3. Verify deployment

```bash
# Check logs trên EC2
ssh -i your-key.pem ubuntu@your-ec2-ip
cd /opt/fastapi-chatbot
docker-compose logs -f

# Check từ browser
http://YOUR_EC2_PUBLIC_IP:8000
```

## 🌐 BƯỚC 6: Setup Nginx Reverse Proxy (Optional nhưng recommended)

### 6.1. Install Nginx

```bash
sudo apt install nginx -y  # Ubuntu
# hoặc
sudo yum install nginx -y  # Amazon Linux
```

### 6.2. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/chatbot

# Paste nội dung sau:
```

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_read_timeout 86400;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Now access: http://YOUR_EC2_PUBLIC_IP (port 80, không cần :8000)
```

### 6.3. Setup SSL với Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

## 📊 BƯỚC 7: Monitoring & Logs

### 7.1. View logs

```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f web
```

### 7.2. Check container status

```bash
docker ps
docker stats
docker-compose ps
```

### 7.3. Health check

```bash
curl http://localhost:8000/api/health
```

### 7.4. Setup CloudWatch (Optional)

Cài CloudWatch agent để monitor EC2:
- CPU usage
- Memory usage
- Disk usage
- Application logs

## 🔄 Deploy Workflow

```
Developer Push → GitHub Actions → Build & Test → Docker Build → Push to ghcr.io
                                                                        ↓
EC2 Instance ← SSH Deploy ← GitHub Actions ← Docker Pull ← ghcr.io
     ↓
docker-compose pull → docker-compose up -d → App Running
```

## 🐛 Troubleshooting

### Deploy fails - Permission denied

```bash
# Check SSH key permissions
chmod 600 your-key.pem

# Verify GitHub Secret SERVER_SSH_KEY có đúng format:
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

### Docker pull fails

```bash
# Re-login to ghcr.io
echo "YOUR_PAT" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Check image exists
docker pull ghcr.io/YOUR_USERNAME/YOUR_REPO:latest
```

### Port 8000 already in use

```bash
# Find process
sudo lsof -i :8000

# Kill process
sudo kill -9 PID

# Or change port in docker-compose.yml
```

### Container keeps restarting

```bash
# Check logs
docker-compose logs web

# Check health
docker inspect fastapi-chatbot

# Common issues:
# - Missing dependencies
# - Wrong environment variables
# - Port conflicts
```

### Cannot access from browser

```bash
# Check security group rules (AWS Console)
# Check if app is running
curl http://localhost:8000

# Check Nginx (if using)
sudo nginx -t
sudo systemctl status nginx
```

## 🎯 Production Checklist

- [ ] Docker & Docker Compose installed
- [ ] Security groups configured
- [ ] SSH key added to GitHub Secrets
- [ ] Server configured in `/opt/fastapi-chatbot`
- [ ] GitHub Container Registry authentication
- [ ] Nginx reverse proxy (optional)
- [ ] SSL certificate (optional)
- [ ] Monitoring setup
- [ ] Backup strategy
- [ ] Log rotation configured

## 📝 Useful Commands

```bash
# Deploy manually
cd /opt/fastapi-chatbot
docker-compose pull && docker-compose up -d --force-recreate

# Rollback
docker-compose down
docker pull ghcr.io/YOUR_USERNAME/YOUR_REPO:PREVIOUS_TAG
docker-compose up -d

# Clean up
docker system prune -a
docker volume prune

# Update env vars
nano docker-compose.yml
docker-compose up -d --force-recreate
```

## 🔗 Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Lưu ý:** 
- Thay `YOUR_GITHUB_USERNAME/YOUR_REPO` bằng thông tin thật
- Thay `YOUR_EC2_PUBLIC_IP` bằng IP thật của EC2
- Bảo mật SSH key - KHÔNG commit vào Git!
