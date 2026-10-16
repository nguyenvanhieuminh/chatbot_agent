# 🔄 GitHub Actions Workflows

## 📋 Workflow Overview

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| **CI/CD Pipeline** | Push to main/develop, PR | Main build & deploy pipeline | ~3-5 min |
| **Test Matrix** | Push, PR, Daily 2 AM | Test across Python versions | ~4-6 min |
| **Security Scanning** | Push, PR, Weekly Monday 9 AM | Comprehensive security checks | ~5-10 min |
| **Docker Publish** | Release, Manual | Multi-platform Docker build | ~8-12 min |

## 1️⃣ CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**

### Test & Lint
```yaml
✓ Install dependencies
✓ Black formatting check
✓ Flake8 linting
✓ Mypy type checking
✓ Run pytest with coverage
✓ Upload to Codecov
```

### Build Docker Image
```yaml
✓ Login to GitHub Container Registry
✓ Build Docker image
✓ Push to ghcr.io/YOUR_USERNAME/YOUR_REPO
✓ Tag: branch name, sha, latest
```

### Deploy to Production
```yaml
✓ SSH to server
✓ Pull latest Docker image
✓ Restart containers
✓ Clean up old images
```
*Only runs on push to `main`*

### Quick Security Check
```yaml
✓ Trivy vulnerability scan
✓ Python Safety check
```

## 2️⃣ Test Matrix (`test.yml`)

**Triggers:**
- Push to any branch
- Pull requests
- Daily at 2 AM UTC (cron)

**Matrix Strategy:**
```yaml
Python: 3.9, 3.10, 3.11, 3.12
OS: ubuntu-latest
```

**Jobs:**
- Run full test suite on each Python version
- Generate coverage reports
- Upload to Codecov (Python 3.11 only)
- Archive HTML coverage reports

## 3️⃣ Security Scanning (`security.yml`) 🆕

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Every Monday at 9 AM UTC

**Jobs:**

### Trivy Filesystem Scan
```yaml
✓ Scan code & dependencies
✓ SARIF report to GitHub Security
✓ Table output for quick review
```

### Dependency Check
```yaml
✓ Safety - Python dependency vulnerabilities
✓ Bandit - Python code security issues
✓ Generate reports as artifacts
```

### CodeQL Analysis
```yaml
✓ Static code analysis
✓ Security & quality queries
✓ Results to GitHub Code Scanning
```

### Secret Scanning
```yaml
✓ TruffleHog - Detect secrets/API keys
✓ Scan entire git history
```

### Docker Security Scan
```yaml
✓ Build Docker image
✓ Trivy scan on image
✓ SARIF report to GitHub Security
```

**Results Location:**
- GitHub Security Tab → Code scanning
- Workflow run artifacts

## 4️⃣ Docker Publish (`docker-publish.yml`)

**Triggers:**
- New release published
- Manual workflow dispatch

**Jobs:**

### Build & Push
```yaml
✓ Multi-platform build (amd64, arm64)
✓ Push to GitHub Container Registry
✓ Tags:
  - branch name
  - git SHA
  - semver (if release)
  - latest (if default branch)
```

**Registry:** `ghcr.io/YOUR_USERNAME/YOUR_REPO`

## 🔐 Required Permissions

### For Security Workflows:
```yaml
permissions:
  contents: read
  security-events: write  # Required for SARIF upload
  actions: read
```

### For Docker Build:
```yaml
permissions:
  contents: read
  packages: write  # Required for ghcr.io
```

## 📊 Viewing Results

### Test Results
- Actions tab → Test Matrix workflow
- Coverage: codecov.io or artifact download

### Security Results
- Security tab → Code scanning alerts
- Security tab → Dependabot alerts
- Actions tab → Security Scanning workflow artifacts

### Docker Images
- Repository → Packages
- `ghcr.io/YOUR_USERNAME/YOUR_REPO:TAG`

## 🚀 Manual Triggers

### Docker Publish
```bash
# Via GitHub UI
Actions → Docker Build & Publish → Run workflow

# Via GitHub CLI
gh workflow run docker-publish.yml
```

### Security Scan
```bash
# Automatically runs, but you can trigger manually
gh workflow run security.yml
```

## 🛠️ Local Testing

### Run CI checks locally:
```bash
make ci  # Runs format-check, lint, type-check, test
```

### Test Docker build:
```bash
make docker-build
make docker-run
```

### Run security checks:
```bash
# Trivy
docker run --rm -v $(pwd):/src aquasec/trivy fs /src

# Safety
pip install safety
safety check

# Bandit
pip install bandit
bandit -r .
```

## 📈 Workflow Dependencies

```
ci-cd.yml:
  test → build → deploy
          ↓
    security-scan (parallel)

test.yml:
  Python 3.9 ─┐
  Python 3.10 ├─→ All run in parallel
  Python 3.11 ├─→ Coverage from 3.11
  Python 3.12 ┘

security.yml:
  trivy-scan ─────┐
  dependency-check├─→ All run in parallel
  codeql-analysis │
  secret-scan ────┤
  docker-security ┘ (only on push)
```

## 🔧 Troubleshooting

### "Resource not accessible" error
✅ **Fixed!** Added proper permissions to workflows.

### Tests failing
```bash
# Run locally to debug
make test
pytest tests/ -v --pdb
```

### Docker build failing
```bash
# Check Dockerfile syntax
docker build -t test .

# Check multi-platform
docker buildx build --platform linux/amd64,linux/arm64 .
```

### Security scan failing
- Check if it's a real vulnerability (not false positive)
- Update dependencies if needed
- Add exceptions in security tool config if false positive

## 📚 References

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Code Scanning](https://docs.github.com/en/code-security/code-scanning)
- [Trivy](https://aquasecurity.github.io/trivy/)
- [CodeQL](https://codeql.github.com/)

## 🎯 Best Practices

1. ✅ Always run `make ci` before pushing
2. 🔒 Review security alerts weekly
3. 📦 Keep dependencies updated (Dependabot)
4. 🧪 Maintain test coverage > 80%
5. 🐳 Scan Docker images before production
6. 🔐 Never commit secrets (use GitHub Secrets)
7. 📊 Monitor workflow run times

---

**Last Updated:** 2024
