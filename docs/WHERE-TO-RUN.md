# 📍 Where To Run Commands - Visual Guide

## 🎯 Overview

```
Your Local Machine → Upload → EC2 Instance → Setup → Deploy
```

## 💻 On Your LOCAL Machine

**Where:** Your Mac/Windows/Linux laptop/desktop

### Step 1: Upload Setup Script

```bash
# Terminal on YOUR COMPUTER
$ cd /Users/m1pro/Documents/web_study
$ scp -i your-key.pem scripts/setup-ec2.sh ubuntu@YOUR_EC2_IP:~
```

**What happens:**
- File `setup-ec2.sh` được upload từ máy bạn lên EC2
- Giống như copy file qua mạng

### Step 2: Connect to EC2

```bash
# Still on YOUR COMPUTER
$ ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

**What happens:**
- Kết nối từ máy bạn vào EC2
- Giống như remote desktop nhưng qua terminal

---

## ☁️ On EC2 Instance

**Where:** Inside the EC2 server (after SSH)

**Notice the prompt change:**
```bash
# Before (your computer):
m1pro@MacBook web_study $

# After SSH (on EC2):
ubuntu@ip-172-31-45-67:~$
```

### Step 3: Run Setup Script

```bash
# Now you're INSIDE EC2
ubuntu@ip-172-31-45-67:~$ bash setup-ec2.sh
```

**Script will ask you:**
```
Enter your GitHub username: your-username
Enter your GitHub repository name: your-repo
Enter your GitHub Personal Access Token: ghp_xxxxx
```

**Script will do:**
- ✅ Update system
- ✅ Install Docker
- ✅ Install Docker Compose
- ✅ Create app directory
- ✅ Pull and start your app

### Step 4: Verify (Still on EC2)

```bash
# Check if app is running
ubuntu@ip-172-31-45-67:~$ cd /opt/fastapi-chatbot
ubuntu@ip-172-31-45-67:/opt/fastapi-chatbot$ docker-compose ps

# View logs
ubuntu@ip-172-31-45-67:/opt/fastapi-chatbot$ docker-compose logs -f

# Press Ctrl+C to stop viewing logs
```

### Step 5: Exit EC2

```bash
ubuntu@ip-172-31-45-67:~$ exit
```

**Now you're back on your local machine!**

---

## 🌐 On GitHub Website

**Where:** github.com in your web browser

### Step 6: Configure GitHub Secrets

1. Go to your repository
2. Click **Settings** tab
3. Left sidebar → **Secrets and variables** → **Actions**
4. Click **New repository secret**

Add 3 secrets:
```
SERVER_HOST = Your EC2 public IP (e.g., 54.123.45.67)
SERVER_USER = ubuntu
SERVER_SSH_KEY = (paste full .pem file content)
```

---

## 💻 Back on LOCAL Machine

### Step 7: Deploy

```bash
# On your computer
$ cd /Users/m1pro/Documents/web_study
$ git add .
$ git commit -m "Configure EC2 deployment"
$ git push origin main
```

**What happens:**
- Code pushed to GitHub
- GitHub Actions triggers
- Automatically deploys to EC2
- No more manual SSH needed!

### Step 8: Test in Browser

Open browser on your computer:
```
http://YOUR_EC2_PUBLIC_IP:8000
```

---

## 📊 Visual Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR COMPUTER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  $ cd web_study                                                 │
│  $ scp -i key.pem setup-ec2.sh ubuntu@EC2_IP:~                 │
│                              │                                   │
│                              │ Upload file                       │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                     EC2 INSTANCE                        │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  File uploaded: ~/setup-ec2.sh                          │    │
│  │                                                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  $ ssh -i key.pem ubuntu@EC2_IP                                │
│                              │                                   │
│                              │ SSH connect                       │
│                              ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│              NOW YOU'RE INSIDE EC2                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ubuntu@ec2:~$ bash setup-ec2.sh                               │
│                              │                                   │
│                              │ Installs & configures             │
│                              ▼                                   │
│                      Docker installed ✅                        │
│                      App running ✅                             │
│                                                                  │
│  ubuntu@ec2:~$ exit                                            │
│                              │                                   │
│                              │ Exit SSH                          │
│                              ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│              BACK ON YOUR COMPUTER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  $ git push origin main                                         │
│                              │                                   │
│                              │ Trigger                           │
│                              ▼                                   │
│                    GitHub Actions ⚙️                            │
│                              │                                   │
│                              │ Auto-deploy                       │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              EC2 - App Updated! 🎉                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Open browser: http://EC2_IP:8000 ✅                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Summary

| Step | Where | Command | Purpose |
|------|-------|---------|---------|
| 1 | Local | `scp` | Upload script |
| 2 | Local | `ssh` | Connect to EC2 |
| 3 | EC2 | `bash setup-ec2.sh` | Install & setup |
| 4 | EC2 | `docker-compose ps` | Verify |
| 5 | EC2 | `exit` | Leave EC2 |
| 6 | Browser | GitHub Secrets | Configure |
| 7 | Local | `git push` | Deploy |
| 8 | Browser | Open URL | Test app |

---

## ❓ FAQ

### How do I know if I'm on my computer or EC2?

**Check the terminal prompt:**

```bash
# Your computer (Mac example)
m1pro@MacBook web_study $

# EC2 (Ubuntu)
ubuntu@ip-172-31-45-67:~$

# EC2 (Amazon Linux)
ec2-user@ip-172-31-45-67:~$
```

### What if I lose connection to EC2?

Just SSH again:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### Do I need to be connected to EC2 all the time?

**No!** After initial setup:
1. Setup once with `setup-ec2.sh`
2. Configure GitHub Secrets once
3. From then on, just `git push` from your computer
4. GitHub Actions will auto-deploy to EC2

### Where is my .pem file?

Usually in:
- Mac/Linux: `~/Downloads/your-key.pem` or `~/.ssh/your-key.pem`
- Windows: `C:\Users\YourName\Downloads\your-key.pem`

Move it to a safe place and set permissions:
```bash
chmod 600 your-key.pem
```

---

## 🆘 Still Confused?

Follow these exact steps:

### On Terminal (Your Computer):
```bash
cd /Users/m1pro/Documents/web_study
scp -i ~/path/to/your-key.pem scripts/setup-ec2.sh ubuntu@54.123.45.67:~
ssh -i ~/path/to/your-key.pem ubuntu@54.123.45.67
```

### Now You'll See EC2 Prompt:
```bash
ubuntu@ip-172-31-45-67:~$ bash setup-ec2.sh
# Follow the prompts
# When done:
ubuntu@ip-172-31-45-67:~$ exit
```

### Back on Your Computer:
```bash
# Configure GitHub Secrets (in browser)
# Then:
git push origin main
```

**Done! 🎉**

---

See also:
- [QUICK-DEPLOY.md](../QUICK-DEPLOY.md) - Quick start guide
- [AWS-EC2-DEPLOY.md](AWS-EC2-DEPLOY.md) - Detailed deployment
- [GITHUB-SECRETS-GUIDE.md](GITHUB-SECRETS-GUIDE.md) - Secrets setup
