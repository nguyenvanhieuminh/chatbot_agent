# 🛤️ PathVN — Nền tảng học tập từ phổ thông đến chuyên môn

**Full-stack React + Node.js + SQLite** với Admin CMS đầy đủ chức năng.  
Học phổ thông (lớp 1-12), kỹ năng chuyên môn (lập trình, design, data...) và blog.

**Tech Stack:** React + Vite + Tailwind CSS v4 | Express + better-sqlite3

## Chạy dự án

```bash
npm install
npm run dev      # Chạy cả API + Frontend
                 # API:  http://localhost:3001/api
                 # Web:  http://localhost:5173
                 # Admin: http://localhost:5173/#/admin/login

npm run build    # Xuất production build
npm start        # Chạy production (API + static files)
```

**Đăng nhập admin lần đầu**: Xem terminal để lấy username/password được generate tự động.

## Tính năng

### 👨‍🎓 Người học
| Tính năng | Đường dẫn | Ghi chú |
|---|---|---|
| Tổng hợp lý thuyết | `/bai-hoc/:id` | Công thức KaTeX, bảng so sánh, ví dụ mẫu, cảnh báo lỗi hay gặp |
| Flashcard | `/flashcard` | Lật thẻ 3D, đánh dấu *đã nhớ / cần ôn*, trộn thẻ; `Space` lật, `←` `→` chuyển |
| Trắc nghiệm | `/trac-nghiem` | Chấm điểm, hiện đáp án + giải thích, lưu điểm tốt nhất |
| Ghi chú cá nhân | trong bài học | Auto-save sau 600ms, lưu localStorage |
| Tiến độ | `/tien-do` | Vòng tiến độ, chuỗi ngày học, xuất/nhập JSON |
| Tìm kiếm | `Ctrl/Cmd + K` | Full-text, **bỏ dấu vẫn tìm được** (gõ `dao ham` → `đạo hàm`) |
| Dark mode | toggle navbar | Theo hệ thống hoặc tùy chỉnh |

### 🔐 Admin CMS
| Tính năng | Đường dẫn | Ghi chú |
|---|---|---|
| Dashboard | `/admin/dashboard` | Thống kê + lịch sử hoạt động |
| Tạo khung nội dung | `/admin/khung-noi-dung` | Dán mục lục → tạo hàng loạt chương + bài nháp |
| Quản lý bài học | `/admin/bai-hoc` | Lọc, tìm, đổi trạng thái, soạn nội dung |
| Quản lý môn học | `/admin/mon-hoc` | Sửa tên, icon, màu, khối lớp |
| Import/Export | `/admin/import-export` | Sao lưu / khôi phục JSON |
| Đổi mật khẩu | `/admin/tai-khoan` | Có validation |

📖 **Chi tiết**: Xem [DESIGN.md](DESIGN.md) — phân cấp nội dung, cách admin thêm nội dung, API.

## Cấu trúc

```
web/
├── shared/
│   └── curriculum.js       # Cấp học, khối lớp, danh mục môn — dùng chung server + client
├── server/
│   ├── routes/             # public.js, auth.js, admin.js
│   ├── db.js               # Schema, migration, backfill chương
│   ├── auth.js             # Hash scrypt + session
│   ├── validate.js         # Làm sạch & kiểm tra payload
│   ├── seed.js             # Dữ liệu mẫu
│   └── index.js            # Entry point
├── src/
│   ├── api/client.js       # Fetch wrapper cho toàn bộ endpoint
│   ├── context/            # Theme, Progress, Auth, Content
│   ├── components/
│   │   └── admin/          # BlockEditor, CardQuizEditor
│   ├── lib/
│   │   ├── parseContent.js # Cú pháp "dán hàng loạt" ↔ blocks
│   │   ├── search.js       # Tìm kiếm bỏ dấu tiếng Việt
│   │   └── palette.js      # Bảng màu môn học
│   └── pages/              # Trang người học + 8 trang admin
└── data/hoctap.db          # SQLite (gitignored)
```

## Thêm nội dung mới

Mở file môn trong `src/data/`, thêm một object vào mảng `lessons`:

```js
{
  id: 'toan.ten-bai',          // phải là duy nhất toàn app
  title: 'Tên bài',
  grade: 12,
  minutes: 15,
  summary: 'Mô tả ngắn hiện trên thẻ bài học.',
  keywords: ['từ khoá để tìm kiếm'],
  blocks: [ /* xem các loại block bên dưới */ ],
  flashcards: [{ front: '...', back: '...' }],
  quiz: [{ question: '...', options: ['A','B','C','D'], answer: 0, explain: '...' }],
}
```

Muốn thêm **môn mới**: tạo file mới trong `src/data/` theo cùng khuôn (`id`, `name`, `short`, `icon`, `accent`, `tint`, `description`, `lessons`) rồi import vào `src/data/index.js`.

### Các loại block dùng được trong `blocks`

```js
{ type: 'heading', text: '1. Tiêu đề' }
{ type: 'text',    text: 'Đoạn văn, hỗ trợ **in đậm** và công thức $x^2$.' }
{ type: 'list',    items: ['gạch đầu dòng', '...'] }
{ type: 'formula', latex: String.raw`\frac{a}{b}`, caption: 'chú thích' }
{ type: 'table',   headers: ['A','B'], rows: [['1','2']] }
{ type: 'note',    variant: 'info' | 'tip' | 'warn', title: '...', text: '...' }
{ type: 'steps',   title: '...', items: ['bước 1', 'bước 2'] }
{ type: 'compare', left: { title, items }, right: { title, items } }
{ type: 'example', problem: '...', solution: ['bước giải 1', '...'] }
```

Trong mọi trường text: `$...$` render công thức toán (KaTeX), `**...**` in đậm, `*...*` in nghiêng.

## Deploy

### Production với cả API + Frontend
```bash
npm run build        # Build frontend vào dist/
node server/index.js # Serve API + static files
# hoặc
npm start
```

Deploy lên VPS/cloud:
- Upload toàn bộ project
- Install dependencies: `npm install --production`
- Chạy: `PORT=3000 node server/index.js`
- Dùng PM2 để keep-alive: `pm2 start server/index.js --name hoctap`

### Static-only (không có admin)
Build frontend: `npm run build` rồi deploy thư mục `dist/` lên static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).  
⚠️ **Lưu ý**: Static mode không có backend nên không dùng được admin CMS.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, React Router
- **Backend**: Node.js, Express, `node:sqlite` (built-in, không cần native module)
- **Auth**: Session-based với httpOnly cookie
- **Math rendering**: KaTeX
- **Styling**: Tailwind CSS v4 (CSS-first config)

## Documentation

- [README.md](README.md) — Overview (file này)
- [DESIGN.md](DESIGN.md) — Phân cấp nội dung, database, luồng quản trị, API reference

## 🚀 Deployment với Docker

### Build Docker Image

```bash
docker build -t pathvn:latest .
```

### AWS EC2 Deployment

1. **Setup EC2**:
```bash
# SSH vào EC2
ssh -i key-ec2.pem ec2-user@YOUR_IP

# Tạo thư mục
sudo mkdir -p /opt/pathvn
cd /opt/pathvn

# Tạo docker-compose.yml
sudo tee docker-compose.yml > /dev/null << 'COMPOSE'
version: '3.8'
services:
  pathvn:
    image: ghcr.io/YOUR_USERNAME/YOUR_REPO:latest
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    environment:
      - NODE_ENV=production
COMPOSE
```

2. **Login GitHub Container Registry**:
```bash
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

3. **Start**:
```bash
docker-compose pull
docker-compose up -d
```

### GitHub Actions CI/CD

Thêm secrets vào **Settings → Secrets → Actions**:
- `SERVER_HOST`: EC2 IP
- `SERVER_USER`: ec2-user
- `SERVER_SSH_KEY`: Nội dung file .pem

Push lên `main` branch sẽ tự động deploy!

### Security Group (AWS)

Mở port:
- **22**: SSH
- **3001**: PathVN app

Truy cập: `http://YOUR_EC2_IP:3001`

---

Xem [CI-CD-SETUP.md](CI-CD-SETUP.md) để biết chi tiết.
