# ⚡ Quick Deploy to AWS EC2 (5 phút)

## 🎯 Cần có sẵn:
- ✅ EC2 instance đang chạy (Ubuntu/Amazon Linux)
- ✅ File .pem key để SSH
- ✅ GitHub repository với code

## 🚀 Bước 1: Upload & Chạy Script (2 phút)

### 1.1. Trên máy LOCAL của bạn:
```bash
# Upload script lên EC2
scp -i your-key.pem scripts/setup-ec2.sh ubuntu@YOUR_EC2_IP:~
```

### 1.2. SSH vào EC2 (vẫn trên máy LOCAL):
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### 1.3. Chạy script (bây giờ đang TRONG EC2):
```bash
# Prompt sẽ đổi thành: ubuntu@ip-xxx:~$
bash setup-ec2.sh
```

**⚠️ Lưu ý:** 
- Bước 1.1 và 1.2 chạy trên **máy local** của bạn
- Bước 1.3 chạy **trong EC2** (sau khi SSH vào)
- 📖 Xem chi tiết: [docs/WHERE-TO-RUN.md](docs/WHERE-TO-RUN.md)

**Script sẽ tự động:**
- ✅ Update system
- ✅ Install Docker & Docker Compose
- ✅ Create app directory
- ✅ Login ghcr.io
- ✅ Pull & start app

**Bạn chỉ cần nhập:**
- GitHub username
- Repository name
- Personal Access Token (PAT)

## 🔐 Bước 2: Configure Security Group (1 phút)

**AWS Console → EC2 → Security Groups → Inbound Rules:**

Add rules:
```
Type         Port    Source          Description
SSH          22      Your IP         SSH access
Custom TCP   8000    0.0.0.0/0      FastAPI app
```

## 🔑 Bước 3: Add GitHub Secrets (2 phút)

**GitHub → Repository → Settings → Secrets → Actions:**

Add 3 secrets:
```
SERVER_HOST     = Your EC2 public IP
SERVER_USER     = ubuntu (hoặc ec2-user)
SERVER_SSH_KEY  = Paste toàn bộ nội dung file .pem
```

## ✅ Bước 4: Test

### Browser:
```
http://YOUR_EC2_IP:8000
```

### Push code để test auto-deploy:
```bash
git add .
git commit -m "Test deployment"
git push origin main
```

→ GitHub Actions sẽ tự động deploy! 🎉

---

## 📋 Nếu gặp lỗi:

### "Can't pull image"
→ Chưa có image trên ghcr.io
→ Push code lên GitHub để trigger build lần đầu

### "Can't access in browser"
→ Check Security Group có mở port 8000 chưa

### "Deploy fails"
→ Check GitHub Secrets đã set đúng chưa

---

**Chi tiết đầy đủ:** [docs/AWS-EC2-DEPLOY.md](docs/AWS-EC2-DEPLOY.md)
**Checklist:** [docs/DEPLOY-CHECKLIST.md](docs/DEPLOY-CHECKLIST.md)
