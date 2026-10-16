# 🔐 GitHub Secrets Setup Guide

## 📝 Overview

GitHub Secrets cần thiết để deploy lên EC2 từ GitHub Actions.

## 🎯 Required Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SERVER_HOST` | EC2 Public IP | `54.123.45.67` |
| `SERVER_USER` | SSH username | `ubuntu` or `ec2-user` |
| `SERVER_SSH_KEY` | Private SSH key | Content of .pem file |

## 🔑 1. Create GitHub Personal Access Token (PAT)

**Để login vào ghcr.io và pull Docker images.**

### Steps:

1. **Go to GitHub Settings:**
   - Click your avatar → **Settings**
   - Scroll down → **Developer settings** (bottom left)
   - Click **Personal access tokens**
   - Click **Tokens (classic)**

2. **Generate new token:**
   - Click **Generate new token (classic)**
   - **Note:** `FastAPI Chatbot Deploy`
   - **Expiration:** 90 days or No expiration
   - **Select scopes:**
     - ✅ `read:packages` (required)
     - ✅ `write:packages` (if you want to push images)
   - Click **Generate token**

3. **Copy token:**
   - ⚠️ Copy now! You won't see it again.
   - Save it somewhere safe temporarily

**Token looks like:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🔐 2. Add Secrets to GitHub Repository

### Navigate to Secrets:

1. Go to your repository
2. Click **Settings** tab
3. Left sidebar → **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Add Each Secret:

#### Secret 1: SERVER_HOST

```
Name: SERVER_HOST
Secret: 54.123.45.67
```
*(Thay bằng IP thật của EC2)*

#### Secret 2: SERVER_USER

```
Name: SERVER_USER
Secret: ubuntu
```
*(Hoặc `ec2-user` nếu dùng Amazon Linux)*

#### Secret 3: SERVER_SSH_KEY

```
Name: SERVER_SSH_KEY
Secret: (paste toàn bộ nội dung .pem file)
```

**Format của SSH key:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
... (nhiều dòng) ...
... (nhiều dòng) ...
-----END RSA PRIVATE KEY-----
```

**⚠️ Important:**
- Include `BEGIN` and `END` lines
- Paste toàn bộ, không thêm/bớt gì
- Không có spaces hoặc extra lines

### How to get .pem content:

**On Mac/Linux:**
```bash
cat your-key.pem
```

**On Windows:**
```cmd
type your-key.pem
```

Then copy and paste ALL content.

## ✅ Verify Secrets

After adding all 3 secrets, you should see:

```
Repository secrets:
  SERVER_HOST        Updated X minutes ago
  SERVER_USER        Updated X minutes ago
  SERVER_SSH_KEY     Updated X minutes ago
```

## 🧪 Test Secrets

### Method 1: Push to main branch

```bash
git push origin main
```

Watch GitHub Actions → CI/CD Pipeline → Deploy step

### Method 2: Manual SSH test

```bash
# Test if secrets work
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
# If this works, secrets should work too
```

## 🐛 Troubleshooting

### "Permission denied (publickey)"

**Problem:** SSH key is wrong or format is incorrect

**Fix:**
1. Re-copy .pem file content
2. Make sure to include BEGIN/END lines
3. No extra spaces or newlines
4. Update SERVER_SSH_KEY secret

### "No such host"

**Problem:** SERVER_HOST is wrong

**Fix:**
1. Get EC2 public IP from AWS Console
2. Update SERVER_HOST secret
3. Make sure it's IP only (no `http://` or port)

### "ubuntu vs ec2-user"

**Problem:** Wrong username for your AMI

**Fix:**
- Ubuntu AMI → use `ubuntu`
- Amazon Linux → use `ec2-user`
- Update SERVER_USER secret

### Deploy still fails

**Checklist:**
- [ ] All 3 secrets are set
- [ ] SERVER_HOST is correct public IP
- [ ] SERVER_USER matches your AMI
- [ ] SERVER_SSH_KEY includes BEGIN/END lines
- [ ] EC2 security group allows SSH (port 22)
- [ ] /opt/fastapi-chatbot exists on EC2
- [ ] Docker is installed on EC2

## 🔄 Update Secrets

To update a secret:

1. Repository → Settings → Secrets → Actions
2. Click secret name
3. Click **Update secret**
4. Enter new value
5. Click **Update secret**

## 🗑️ Delete Secrets

To delete a secret:

1. Repository → Settings → Secrets → Actions
2. Click secret name
3. Scroll down
4. Click **Remove secret**

## 📊 Secrets Usage

Secrets are used in `.github/workflows/ci-cd.yml`:

```yaml
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
```

## 🔒 Security Best Practices

- ✅ Never commit secrets to Git
- ✅ Never log secrets in GitHub Actions
- ✅ Use short-lived tokens when possible
- ✅ Rotate secrets regularly
- ✅ Use separate secrets for dev/prod
- ✅ Revoke unused PATs
- ❌ Never share secrets via chat/email
- ❌ Never screenshot secrets
- ❌ Never upload .pem files to GitHub

## 📚 Related Docs

- [QUICK-DEPLOY.md](../QUICK-DEPLOY.md) - 5-minute deployment
- [AWS-EC2-DEPLOY.md](AWS-EC2-DEPLOY.md) - Detailed EC2 setup
- [DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md) - Step-by-step guide

---

**Need help?** Check [AWS-EC2-DEPLOY.md](AWS-EC2-DEPLOY.md) for troubleshooting.
