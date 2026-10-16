# 🤝 Contributing Guide

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án! 

## 🚀 Quick Start

### 1. Fork và Clone

```bash
# Fork repo trên GitHub, sau đó clone
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Setup Development Environment

```bash
# Cài đặt dependencies và pre-commit hooks
make dev-setup

# Hoặc manual:
pip install -r requirements-dev.txt
pre-commit install
```

### 3. Tạo Branch Mới

```bash
git checkout -b feature/amazing-feature
# hoặc
git checkout -b fix/bug-description
```

## 📝 Development Workflow

### Code Style

Dự án sử dụng **Black** cho formatting và **Flake8** cho linting.

```bash
# Auto-format code
make format

# Check formatting
make format-check

# Lint code
make lint

# Type check
make type-check

# Run all checks
make ci
```

### Pre-commit Hooks

Khi bạn đã setup (`make setup-hooks`), code sẽ tự động được:
- ✅ Format với Black
- ✅ Sort imports với isort
- ✅ Check với Flake8
- ✅ Remove trailing whitespace
- ✅ Security scan với Bandit

**Mỗi lần commit!**

### Testing

```bash
# Run tests
make test

# Run với coverage
make test-cov

# View coverage report
open htmlcov/index.html
```

**Quan trọng:** Luôn thêm tests cho features mới!

## 📋 Commit Messages

Sử dụng format:

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: Feature mới
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc)
- `refactor`: Code refactoring
- `test`: Thêm tests
- `chore`: Maintenance tasks

**Ví dụ:**

```
feat: add user authentication

- Implement JWT authentication
- Add login/logout endpoints
- Add user registration

Closes #123
```

## 🔀 Pull Request Process

### 1. Checklist trước khi submit

- [ ] Code đã được format (`make format`)
- [ ] Tests pass (`make test`)
- [ ] Lint pass (`make lint`)
- [ ] Coverage không giảm
- [ ] Documentation được update (nếu cần)
- [ ] CHANGELOG được update (nếu cần)

### 2. Submit PR

```bash
git push origin feature/amazing-feature
```

Sau đó tạo Pull Request trên GitHub với:
- **Tiêu đề rõ ràng**
- **Mô tả chi tiết** những gì đã thay đổi
- **Link đến issue** (nếu có)
- **Screenshots** (nếu thay đổi UI)

### 3. Code Review

- Trả lời comments
- Update code theo feedback
- Request re-review khi done

### 4. Merge

Khi PR được approve, maintainer sẽ merge.

## 🐛 Bug Reports

Tạo issue với:
- **Tiêu đề rõ ràng**
- **Mô tả chi tiết** bug
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Environment** (OS, Python version, etc)
- **Screenshots** (nếu có)

## 💡 Feature Requests

Tạo issue với:
- **Tiêu đề rõ ràng**
- **Mô tả chi tiết** feature
- **Use case** - Tại sao cần feature này?
- **Proposed solution** (optional)
- **Alternatives** (optional)

## 🎨 Code Standards

### Python Style

- Follow [PEP 8](https://pep8.org/)
- Line length: 100 characters (Black default)
- Use type hints khi có thể
- Write docstrings cho functions/classes

### Example:

```python
def process_message(message: str, user_id: int) -> dict:
    """
    Xử lý tin nhắn từ user.
    
    Args:
        message: Nội dung tin nhắn
        user_id: ID của user
        
    Returns:
        Dict chứa response từ bot
        
    Raises:
        ValueError: Nếu message rỗng
    """
    if not message:
        raise ValueError("Message cannot be empty")
    
    return {
        "response": generate_response(message),
        "user_id": user_id,
        "timestamp": datetime.now()
    }
```

### Testing Standards

```python
def test_process_message_success():
    """Test xử lý tin nhắn thành công"""
    # Arrange
    message = "Hello"
    user_id = 1
    
    # Act
    result = process_message(message, user_id)
    
    # Assert
    assert "response" in result
    assert result["user_id"] == user_id
    assert "timestamp" in result


def test_process_message_empty_raises_error():
    """Test tin nhắn rỗng raise ValueError"""
    with pytest.raises(ValueError, match="cannot be empty"):
        process_message("", 1)
```

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [pytest Documentation](https://docs.pytest.org/)
- [Black Documentation](https://black.readthedocs.io/)
- [Pre-commit Documentation](https://pre-commit.com/)

## ❓ Questions?

Tạo issue hoặc liên hệ maintainers.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Happy Contributing! 🎉**
