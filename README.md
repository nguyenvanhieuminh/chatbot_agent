# FastAPI Chatbot Web App

Một ứng dụng web chatbot sử dụng FastAPI và WebSocket.

## Cài đặt

1. Tạo virtual environment (khuyến nghị):
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

## Chạy ứng dụng

```bash
python main.py
```

Hoặc dùng uvicorn trực tiếp:
```bash
uvicorn main:app --reload
```

Ứng dụng sẽ chạy tại: http://localhost:8000

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

## Phát triển thêm

### Tích hợp AI thật:
- OpenAI GPT API
- Google Gemini API
- Anthropic Claude API
- Local LLM với Ollama

### Database & Storage:
- Lưu lịch sử chat: SQLite, PostgreSQL
- Redis cho session management

### Features nâng cao:
- Multi-user chat rooms
- File upload & sharing
- Voice chat
- Authentication & user profiles
