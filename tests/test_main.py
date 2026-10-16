"""
Unit tests cho FastAPI Chatbot
"""

import pytest
from fastapi.testclient import TestClient
from main import app, generate_bot_response

client = TestClient(app)


def test_home_page():
    """Test trang chủ trả về HTML"""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Chatbot" in response.text


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_bot_response_greeting():
    """Test bot response với lời chào"""
    response = generate_bot_response("xin chào")
    assert "chào" in response.lower()


def test_bot_response_name():
    """Test bot response hỏi tên"""
    response = generate_bot_response("tên bạn là gì")
    assert "bot" in response.lower() or "ai" in response.lower()


def test_bot_response_help():
    """Test bot response với help"""
    response = generate_bot_response("help")
    assert len(response) > 0


def test_bot_response_goodbye():
    """Test bot response tạm biệt"""
    response = generate_bot_response("bye")
    assert "tạm biệt" in response.lower() or "gặp lại" in response.lower()


def test_bot_response_question():
    """Test bot response với câu hỏi"""
    response = generate_bot_response("Bạn có khỏe không?")
    assert len(response) > 0


@pytest.mark.asyncio
async def test_websocket_connection():
    """Test WebSocket connection"""
    with client.websocket_connect("/ws/chat") as websocket:
        # Gửi tin nhắn
        websocket.send_json({"message": "xin chào"})

        # Nhận phản hồi
        data = websocket.receive_json()

        assert "message" in data
        assert "timestamp" in data
        assert data["sender"] == "bot"
        assert len(data["message"]) > 0
