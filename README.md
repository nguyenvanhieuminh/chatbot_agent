# 🤖 FastAPI Chatbot Web App

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![Run Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Run%20Tests/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Một ứng dụng web chatbot hiện đại sử dụng FastAPI và WebSocket với CI/CD pipeline hoàn chỉnh.

## 📸 Screenshots

![Chatbot Interface](https://via.placeholder.com/800x400/667eea/ffffff?text=Chatbot+Interface)

## 🚀 Quick Start

### Cài đặt Local

1. Clone repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

2. Tạo virtual environment (khuyến nghị):
```bash
python -m venv venv
source venv/bin/activate  # Trên macOS/Linux
# hoặc
venv\Scripts\activate  # Trên Windows
```

2. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

3. Chạy ứng dụng:

```bash
python main.py
```

Hoặc dùng uvicorn với auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

4. Mở trình duyệt: **http://localhost:8000**

### 🐳 Docker

```bash
# Build image
docker build -t fastapi-chatbot .

# Run container
docker run -p 8000:8000 fastapi-chatbot

# Hoặc dùng docker-compose
docker-compose up -d
```

### ☁️ Deploy lên AWS EC2

**Quick Start (5 phút):**
```bash
# 1. Upload setup script
scp -i your-key.pem scripts/setup-ec2.sh ubuntu@EC2_IP:~

# 2. SSH và chạy script
ssh -i your-key.pem ubuntu@EC2_IP
bash setup-ec2.sh

# 3. Configure Security Group (port 22, 8000)
# 4. Add GitHub Secrets (SERVER_HOST, SERVER_USER, SERVER_SSH_KEY)
# 5. Push code → Auto deploy! 🚀
```

**Documentation:**
- ⚡ [Quick Deploy Guide](QUICK-DEPLOY.md) - 5 phút setup
- 📖 [Detailed AWS EC2 Guide](docs/AWS-EC2-DEPLOY.md) - Full instructions
- ✅ [Deployment Checklist](docs/DEPLOY-CHECKLIST.md) - Step-by-step
- 🔧 [CI/CD Setup](CI-CD-SETUP.md) - General deployment options

## Tính năng

- 💬 Chat real-time với WebSocket
- 🤖 Bot tự động trả lời thông minh
- 📱 Giao diện responsive, đẹp mắt
- ⚡ Kết nối WebSocket tự động reconnect
- 🎨 Hiệu ứng animation mượt mà

## API Endpoints

- `GET /` - Trang chủ chatbot
- `WS /ws/chat` - WebSocket endpoint cho chat
- `GET /api/health` - Kiểm tra trạng thái server
- `GET /docs` - Swagger UI documentation

## Cấu trúc project

```
web_study/
├── main.py              # File chính - FastAPI app với WebSocket
├── requirements.txt     # Dependencies
├── templates/           # Thư mục chứa HTML templates
│   └── chat.html       # Giao diện chatbot
└── README.md           # File hướng dẫn này
```

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov httpx

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html

# View coverage report
open htmlcov/index.html
```

## 🛠️ CI/CD Pipeline

Project này có complete CI/CD pipeline với GitHub Actions:

- ✅ **Automated Testing** - Test trên Python 3.9-3.12
- 🎨 **Code Quality** - Black, Flake8, Mypy
- 🐳 **Docker Build** - Multi-platform images
- 🚀 **Auto Deploy** - Deploy to production
- 🔒 **Security Scan** - Trivy vulnerability scanning
- 📦 **Dependency Updates** - Dependabot

Xem chi tiết setup trong [CI-CD-SETUP.md](CI-CD-SETUP.md)

## 📁 Project Structure

```
web_study/
├── .github/
│   ├── workflows/
│   │   ├── ci-cd.yml           # Main CI/CD pipeline
│   │   ├── test.yml            # Test matrix
│   │   └── docker-publish.yml  # Docker publishing
│   └── dependabot.yml          # Dependency updates
├── templates/
│   └── chat.html               # Chatbot UI
├── tests/
│   └── test_main.py           # Unit tests
├── main.py                    # FastAPI application
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Docker image config
├── docker-compose.yml         # Docker Compose config
├── pyproject.toml            # Tool configs
├── .gitignore                # Git ignore rules
├── .dockerignore             # Docker ignore rules
├── CI-CD-SETUP.md            # CI/CD documentation
└── README.md                 # This file
```

## 🔧 Development

### Code Formatting
```bash
pip install black
black .
```

### Linting
```bash
pip install flake8
flake8 .
```

### Type Checking
```bash
pip install mypy
mypy main.py
```

## 📚 API Documentation

Khi app đang chạy, truy cập:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🌟 Roadmap

### Phase 1: Core Features ✅
- [x] WebSocket chat
- [x] Responsive UI
- [x] Bot responses

### Phase 2: CI/CD ✅
- [x] GitHub Actions
- [x] Docker support
- [x] Automated tests

### Phase 3: AI Integration 🚧
- [ ] OpenAI GPT API
- [ ] Google Gemini API
- [ ] Anthropic Claude API
- [ ] Local LLM với Ollama

### Phase 4: Advanced Features 📋
- [ ] User authentication
- [ ] Chat history database
- [ ] Multi-user rooms
- [ ] File upload
- [ ] Voice chat

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern web framework
- [Uvicorn](https://www.uvicorn.org/) - ASGI server
- [GitHub Actions](https://github.com/features/actions) - CI/CD platform
