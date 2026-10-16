from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import json

app = FastAPI(title="Chatbot Web App")

templates = Jinja2Templates(directory="templates")


# Lưu trữ các kết nối WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)


manager = ConnectionManager()


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Trang chủ - giao diện chatbot"""
    return templates.TemplateResponse("chat.html", {"request": request, "title": "Chatbot"})


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint cho chat real-time"""
    await manager.connect(websocket)
    try:
        while True:
            # Nhận tin nhắn từ client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            user_message = message_data.get("message", "")

            # Xử lý và tạo phản hồi từ bot
            bot_response = generate_bot_response(user_message)

            # Gửi phản hồi về client
            response = {
                "message": bot_response,
                "timestamp": datetime.now().strftime("%H:%M"),
                "sender": "bot",
            }
            await manager.send_message(json.dumps(response), websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)


def generate_bot_response(user_message: str) -> str:
    """Tạo phản hồi của bot dựa trên tin nhắn người dùng"""
    user_message_lower = user_message.lower()

    # Các câu trả lời mẫu
    if (
        "xin chào" in user_message_lower
        or "hello" in user_message_lower
        or "hi" in user_message_lower
    ):
        return "Xin chào! Tôi là chatbot AI. Tôi có thể giúp gì cho bạn? 😊"

    elif "tên" in user_message_lower and "gì" in user_message_lower:
        return "Tôi là Bot AI, một trợ lý ảo được tạo bằng FastAPI!"

    elif "khỏe" in user_message_lower or "thế nào" in user_message_lower:
        return "Tôi vẫn khỏe và sẵn sàng trò chuyện với bạn! Cảm ơn đã hỏi 💚"

    elif "giúp" in user_message_lower or "help" in user_message_lower:
        return (
            "Tôi có thể trả lời các câu hỏi cơ bản, trò chuyện với bạn. Hãy thử hỏi tôi điều gì đó!"
        )

    elif "bye" in user_message_lower or "tạm biệt" in user_message_lower:
        return "Tạm biệt! Hẹn gặp lại bạn sau! 👋"

    elif "cảm ơn" in user_message_lower or "thank" in user_message_lower:
        return "Không có gì! Rất vui được giúp bạn 😊"

    elif "?" in user_message:
        return f"Đây là một câu hỏi hay: '{user_message}'. Tôi đang học cách trả lời tốt hơn! 🤔"

    else:
        responses = [
            f"Thú vị! Bạn nói về: '{user_message}'",
            "Tôi hiểu rồi! Bạn có thể nói thêm không?",
            "Đó là điều thú vị! Cho tôi biết thêm nhé!",
            f"Hmm, về '{user_message}' à? Thú vị đấy!",
        ]
        import random

        return random.choice(responses)


@app.get("/api/health")
async def health_check():
    """Kiểm tra trạng thái server"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
