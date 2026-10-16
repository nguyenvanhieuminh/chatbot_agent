# ✅ AWS EC2 Deployment Checklist

## 📋 Pre-Deployment

### GitHub Setup
- [ ] Code pushed to GitHub repository
- [ ] GitHub Actions workflows running successfully
- [ ] Docker image built and pushed to ghcr.io
- [ ] Repository visibility: Public (or PAT with packages:read if private)

### AWS EC2
- [ ] EC2 instance launched and running
- [ ] OS: Ubuntu 20.04+ or Amazon Linux 2
- [ ] Instance type: t2.micro or better
- [ ] SSH key pair (.pem file) downloaded and saved securely

### Local Machine
- [ ] SSH key (.pem) file saved
- [ ] SSH key permissions: `chmod 600 your-key.pem`
- [ ] Can connect to EC2: `ssh -i your-key.pem ubuntu@EC2_IP`

## 🚀 Deployment Steps

### 1. Prepare EC2 Instance

**Option A: Automatic (Recommended)**
- [ ] Upload `setup-ec2.sh` to EC2:
  ```bash
  scp -i your-key.pem scripts/setup-ec2.sh ubuntu@EC2_IP:~
  ```
- [ ] SSH to EC2 and run:
  ```bash
  bash setup-ec2.sh
  ```
- [ ] Follow prompts (GitHub username, repo, PAT)

**Option B: Manual**
- [ ] Connect to EC2: `ssh -i your-key.pem ubuntu@EC2_IP`
- [ ] Update system: `sudo apt update && sudo apt upgrade -y`
- [ ] Install Docker (see [AWS-EC2-DEPLOY.md](AWS-EC2-DEPLOY.md))
- [ ] Install Docker Compose
- [ ] Create `/opt/fastapi-chatbot` directory
- [ ] Create `docker-compose.yml`
- [ ] Login to ghcr.io
- [ ] Pull and start application

### 2. Configure AWS Security Groups

**In AWS Console → EC2 → Security Groups:**

- [ ] **Inbound Rules:**
  - [ ] SSH (22) from Your IP
  - [ ] Custom TCP (8000) from 0.0.0.0/0
  - [ ] HTTP (80) from 0.0.0.0/0 (if using Nginx)
  - [ ] HTTPS (443) from 0.0.0.0/0 (if using SSL)

- [ ] **Outbound Rules:**
  - [ ] All traffic (default is OK)

### 3. Configure GitHub Secrets

**Repository → Settings → Secrets → Actions:**

- [ ] **SERVER_HOST**: EC2 public IP address
- [ ] **SERVER_USER**: `ubuntu` or `ec2-user`
- [ ] **SERVER_SSH_KEY**: Full content of .pem file
  ```
  -----BEGIN RSA PRIVATE KEY-----
  ...
  -----END RSA PRIVATE KEY-----
  ```

### 4. Test Deployment

- [ ] Access app in browser: `http://EC2_IP:8000`
- [ ] Test chat functionality
- [ ] Check health endpoint: `http://EC2_IP:8000/api/health`
- [ ] View logs: `ssh` to EC2, then `cd /opt/fastapi-chatbot && docker-compose logs -f`

### 5. Setup Nginx Reverse Proxy (Optional)

- [ ] Install Nginx on EC2
- [ ] Configure reverse proxy
- [ ] Test Nginx config: `sudo nginx -t`
- [ ] Restart Nginx: `sudo systemctl restart nginx`
- [ ] Access via port 80: `http://EC2_IP`

### 6. Setup SSL/HTTPS (Optional)

- [ ] Register domain name
- [ ] Point domain to EC2 IP (A record)
- [ ] Install Certbot
- [ ] Obtain SSL certificate: `sudo certbot --nginx -d yourdomain.com`
- [ ] Test auto-renewal: `sudo certbot renew --dry-run`
- [ ] Access via HTTPS: `https://yourdomain.com`

### 7. CI/CD Testing

- [ ] Make a code change
- [ ] Commit and push to main branch
- [ ] Watch GitHub Actions workflow
- [ ] Verify deploy step succeeds
- [ ] Check EC2 - app should auto-update
- [ ] Verify changes in browser

## 🔍 Verification Commands

### On EC2:
```bash
# Check Docker
docker --version
docker-compose --version

# Check containers
docker ps
docker-compose ps

# View logs
cd /opt/fastapi-chatbot
docker-compose logs -f

# Check health
curl http://localhost:8000/api/health

# Check Nginx (if installed)
sudo systemctl status nginx
sudo nginx -t
```

### From Local Machine:
```bash
# Test SSH
ssh -i your-key.pem ubuntu@EC2_IP

# Test app
curl http://EC2_IP:8000/api/health

# Test from browser
# http://EC2_IP:8000
```

## 🐛 Troubleshooting

### Can't SSH to EC2
- [ ] Check Security Group allows SSH (port 22) from your IP
- [ ] Check .pem file permissions: `chmod 600 your-key.pem`
- [ ] Check EC2 instance is running
- [ ] Verify correct username (ubuntu vs ec2-user)

### Can't access app in browser
- [ ] Check Security Group allows port 8000
- [ ] Check app is running: `docker ps`
- [ ] Check logs: `docker-compose logs`
- [ ] Try from EC2: `curl http://localhost:8000`

### GitHub Actions deploy fails
- [ ] Verify GitHub Secrets are set correctly
- [ ] Check SSH key format (include BEGIN/END lines)
- [ ] Check SERVER_HOST is correct public IP
- [ ] Check /opt/fastapi-chatbot exists on EC2
- [ ] Check docker-compose.yml exists

### Docker pull fails
- [ ] Check GitHub PAT has `read:packages` scope
- [ ] Check ghcr.io login: `docker login ghcr.io`
- [ ] Check image name matches workflow
- [ ] Check GitHub Actions built the image

### Container keeps restarting
- [ ] Check logs: `docker-compose logs web`
- [ ] Check health endpoint works
- [ ] Check port 8000 not already in use
- [ ] Check dependencies installed in Docker image

## 📊 Monitoring

### Regular Checks:
- [ ] Check app is running: `docker ps`
- [ ] Check disk space: `df -h`
- [ ] Check logs for errors: `docker-compose logs --tail=100`
- [ ] Check memory usage: `free -h`
- [ ] Test health endpoint

### Setup Monitoring (Optional):
- [ ] AWS CloudWatch metrics
- [ ] CloudWatch logs
- [ ] Uptime monitoring (UptimeRobot, etc.)
- [ ] Log aggregation (CloudWatch Logs, ELK)

## 🔄 Maintenance

### Regular Tasks:
- [ ] Update EC2 packages weekly: `sudo apt update && sudo apt upgrade -y`
- [ ] Clean Docker: `docker system prune -a` (monthly)
- [ ] Check SSL expiry (if using Let's Encrypt)
- [ ] Review logs for errors
- [ ] Check disk space

### Backup Strategy:
- [ ] EC2 AMI snapshots (weekly/monthly)
- [ ] Database backups (if using)
- [ ] Configuration backups

## 📝 Important URLs & Info

```
EC2 Public IP:     ___________________
GitHub Repo:       ___________________
Docker Image:      ghcr.io/___________/___________
App URL:           http://___________________:8000
Domain (if any):   ___________________

GitHub Secrets:
  SERVER_HOST:     ✅ Set
  SERVER_USER:     ✅ Set
  SERVER_SSH_KEY:  ✅ Set

AWS Security Group: ___________________
  Port 22:  ✅ Configured
  Port 8000: ✅ Configured
  Port 80:  ⬜ Configured (if using Nginx)
  Port 443: ⬜ Configured (if using SSL)
```

## ✅ Final Verification

Everything working when:
- [ ] ✅ Can SSH to EC2
- [ ] ✅ Docker and Docker Compose installed
- [ ] ✅ App container running: `docker ps` shows `fastapi-chatbot`
- [ ] ✅ Can access app in browser: `http://EC2_IP:8000`
- [ ] ✅ Chat functionality works
- [ ] ✅ GitHub Actions deploy succeeds
- [ ] ✅ Push to main auto-deploys
- [ ] ✅ Nginx working (if configured)
- [ ] ✅ SSL working (if configured)

---

**🎉 Deployment Complete!**

Your FastAPI Chatbot is now running on AWS EC2 with automated CI/CD deployment from GitHub Actions!

For detailed instructions, see: [AWS-EC2-DEPLOY.md](AWS-EC2-DEPLOY.md)
