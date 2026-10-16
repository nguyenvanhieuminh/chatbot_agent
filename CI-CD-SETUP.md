# 🚀 CI/CD Setup Guide

Hướng dẫn cấu hình CI/CD pipeline với GitHub Actions cho FastAPI Chatbot.

## 📋 Prerequisites

1. **GitHub Repository**: Push code lên GitHub
2. **Docker Hub Account** (optional): Để lưu Docker images
3. **Server** (optional): Để deploy production

## 🔧 Cấu hình GitHub Secrets

Vào repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Required Secrets (nếu dùng Docker Hub):

```
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password
```

### Optional Secrets (nếu deploy lên server):

```
SERVER_HOST=your_server_ip
SERVER_USER=your_ssh_username
SERVER_SSH_KEY=your_private_ssh_key
```

### Alternative Deploy Platforms:

**Railway:**
```
RAILWAY_TOKEN=your_railway_token
```

**Render:**
```
RENDER_DEPLOY_HOOK=your_render_deploy_hook_url
```

## 📝 Workflow Files

### 1. `ci-cd.yml` - Main Pipeline
- ✅ Test & Lint code
- 🐳 Build Docker image
- 🚀 Deploy to production
- 🔒 Security scan

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

### 2. `test.yml` - Testing Matrix
- Test trên nhiều Python versions (3.9, 3.10, 3.11, 3.12)
- Coverage reports
- Chạy tự động mỗi ngày lúc 2 AM

### 3. `docker-publish.yml` - Docker Publishing
- Build multi-platform (amd64, arm64)
- Push to GitHub Container Registry
- Trigger khi có release mới

### 4. `security.yml` - Security Scanning
- **Trivy**: Vulnerability scanning (filesystem & Docker)
- **CodeQL**: Static code analysis
- **Safety**: Python dependency security check
- **Bandit**: Python security linter
- **TruffleHog**: Secret scanning
- Chạy tự động mỗi tuần và khi có push/PR

## 🏃 Workflow Steps

### 1. Test Phase
```yaml
- Checkout code
- Setup Python
- Install dependencies
- Check formatting (Black)
- Lint (Flake8)
- Type check (Mypy)
- Run tests (Pytest)
- Upload coverage
```

### 2. Build Phase
```yaml
- Setup Docker Buildx
- Login to Docker Hub
- Build & push image
- Cache layers
```

### 3. Deploy Phase
```yaml
- SSH to server
- Pull latest image
- Restart containers
- Clean up old images
```

## 🐳 Docker Commands

### Build locally:
```bash
docker build -t fastapi-chatbot .
```

### Run locally:
```bash
docker run -p 8000:8000 fastapi-chatbot
```

### Using docker-compose:
```bash
docker-compose up -d
```

### View logs:
```bash
docker-compose logs -f
```

### Stop:
```bash
docker-compose down
```

## 🧪 Running Tests Locally

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov httpx

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=. --cov-report=html

# View coverage report
open htmlcov/index.html
```

## 📊 Code Quality Tools

### Black (formatting):
```bash
pip install black
black .
black --check .  # Check only
```

### Flake8 (linting):
```bash
pip install flake8
flake8 .
```

### Mypy (type checking):
```bash
pip install mypy
mypy main.py
```

## 🔐 Security Scanning

Workflow tự động chạy:
- **Trivy**: Scan vulnerabilities trong code và dependencies
- **Safety**: Check Python dependencies security issues

## 📈 Badges (Optional)

Thêm vào README.md:

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
![Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Run%20Tests/badge.svg)
![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)
```

## 🚀 Deploy Options

### Option 1: VPS/Server (Manual Setup)
1. Setup server với Docker & Docker Compose
2. Configure SSH access
3. Add server secrets to GitHub
4. Workflow sẽ tự động deploy

### Option 2: Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Option 3: Render
1. Connect GitHub repo
2. Select "Web Service"
3. Use Docker
4. Get deploy hook URL
5. Add to GitHub secrets

### Option 4: Heroku
```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main
```

## 🔄 Continuous Deployment Flow

```
Developer Push → GitHub Actions → Tests → Build → Deploy
     ↓              ↓                ↓        ↓       ↓
   main/dev     Run Tests      Build Docker  Push   SSH/Hook
                    ↓              Image        ↓       ↓
                Coverage            ↓          Registry Server
                Reports         Push to           ↓
                                Registry      Pull & Run
```

## 📝 Environment Variables

Tạo file `.env` cho local development (đừng commit file này):

```env
ENVIRONMENT=development
LOG_LEVEL=debug
API_KEY=your_api_key_here
```

## 🎯 Best Practices

1. ✅ **Always run tests locally** trước khi push
2. 🔒 **Never commit secrets** - dùng GitHub Secrets
3. 📝 **Write meaningful commit messages**
4. 🏷️ **Use semantic versioning** cho releases
5. 🔄 **Keep dependencies updated** - Dependabot sẽ tự động tạo PRs
6. 🧪 **Maintain test coverage** > 80%
7. 📋 **Review Dependabot PRs** thường xuyên

## 🐛 Troubleshooting

### Workflow fails at test step:
```bash
# Run tests locally to debug
pytest tests/ -v --pdb
```

### Docker build fails:
```bash
# Build locally to see errors
docker build -t test .
```

### Deploy fails:
```bash
# Check server SSH connection
ssh user@server_ip
docker ps
docker logs container_name
```

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)

## 🆘 Support

Nếu gặp vấn đề:
1. Check workflow logs trong GitHub Actions tab
2. Review Docker build logs
3. Check server logs: `docker-compose logs -f`
4. Verify all secrets are set correctly

---

**Happy Deploying! 🚀**
