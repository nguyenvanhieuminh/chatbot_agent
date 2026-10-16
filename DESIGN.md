# 📐 PathVN System Design

React + Vite + Tailwind v4 (frontend) · Express + `node:sqlite` (backend) · SQLite (database).

## Phân cấp nội dung

Nội dung tổ chức theo đúng cấu trúc sách giáo khoa:

```
Cấp học (Tiểu học / THCS / THPT)
└── Khối lớp (1 → 12)
    └── Môn học (Toán, Ngữ văn, Vật lí…)
        └── Chương (Chương 1, Chương 2…)
            └── Bài học (lý thuyết + flashcard + trắc nghiệm)
```

`TIERS`, `GRADES`, `SUBJECT_CATALOG`, `GRADE_SUBJECTS` khai báo trong
[shared/curriculum.js](shared/curriculum.js) — dùng chung cho cả server (validate, seed)
và client (điều hướng), nên chương trình học là **cố định**, admin không tạo lớp/môn tuỳ ý.
Admin chỉ thêm **chương** và **bài học** vào khung đó.

## Database

| Bảng | Vai trò |
|---|---|
| `subjects` | Môn học: tên, icon, màu, thứ tự |
| `subject_grades` | Môn này có ở những khối lớp nào (n-n) |
| `chapters` | Chương: thuộc (môn, lớp), có tiêu đề + thứ tự |
| `lessons` | Bài học: thuộc chương (`chapter_id`), chứa `blocks`/`flashcards`/`quiz` dạng JSON |
| `users` | Tài khoản: `role` = `admin` / `teacher` / `student` (mật khẩu hash bằng scrypt) |
| `sessions` | Phiên đăng nhập, cookie `httpOnly`, TTL 7 ngày |
| `audit_log` | Lịch sử hành động của người dùng |
| `classes` | Lớp của giáo viên: `code` là mã tham gia (UNIQUE) |
| `class_members` | Học sinh trong lớp (n-n) |
| `assignments` | Đề kiểm tra: `questions` JSON **cùng shape** với `lessons.quiz` |
| `submissions` | Bài nộp, `UNIQUE (assignment_id, student_id)` — mỗi em nộp một lần |
| `progress` | Tiến độ học đồng bộ lên server, nguồn dữ liệu cho dashboard giáo viên |

Schema đầy đủ ở [server/db.js](server/db.js).

### Vì sao `blocks` là JSON thay vì bảng riêng?

Cấu trúc block linh hoạt (9 loại, mỗi loại field khác nhau), không cần query vào trong
nội dung block — tìm kiếm chỉ dựa trên `title`/`summary`/`keywords`. Giữ JSON giúp
import/export và versioning đơn giản hơn nhiều so với normalize ra bảng.

### Phân quyền

Ba vai trò trong **một** bảng `users` duy nhất, không tách bảng riêng — nhờ vậy `sessions`
và toàn bộ luồng đăng nhập dùng chung một cơ chế.

| Vai trò | Được gì |
|---|---|
| `admin` | Toàn quyền nội dung (`/admin/*`), xem `audit_log` |
| `teacher` | Tạo lớp, giao bài, xem dashboard lớp mình dạy |
| `student` | Tham gia lớp bằng mã, làm bài, xem điểm |

`role` được chốt ở **server**: `POST /api/auth/register` chỉ nhận `teacher` / `student`
(`SELF_SIGNUP_ROLES` trong [server/auth.js](server/auth.js)), nên không thể tự đăng ký
thành `admin`. Tài khoản `admin` chỉ sinh ra từ `ensureDefaultAdmin()` hoặc do admin tạo.

`requireRole(...roles)` trả **401** khi chưa đăng nhập và **403** khi đã đăng nhập nhưng
sai quyền — client cần phân biệt: 401 thì đẩy về `/dang-nhap`, 403 thì hiện thông báo
(đẩy về login sẽ tạo vòng lặp vì người dùng đã đăng nhập rồi).

Vì đăng ký mở cho mọi người, `checkSignupLimit()` giới hạn **5 tài khoản/giờ/IP**; lần
nhập sai dữ liệu không tính vào quota. Tài khoản `disabled` bị coi như chưa đăng nhập
ngay ở `getSessionUser()`, không cần chờ session hết hạn.

## Lớp học và bài kiểm tra

```
Giáo viên ──tạo──▶ Lớp (có mã 6 ký tự)
                    ├── Học sinh tham gia bằng mã
                    └── Đề kiểm tra ──▶ Bài nộp (tự chấm)
```

### Ba chỗ dễ rò rỉ dữ liệu, và cách chặn

**1. Giáo viên xem lớp của người khác.** Mọi route trong
[server/routes/teacher.js](server/routes/teacher.js) bắt buộc đi qua `getOwnedClass()` —
hàm này lấy lớp **và** kiểm tra `teacher_id` trong cùng một bước. Nếu chỉ tra theo
`classes.id`, đổi id trên URL là đọc được lớp người khác. Trả **404 thay vì 403** để
không tiết lộ rằng lớp đó có tồn tại.

**2. Đáp án lộ trước khi nộp.** `rowToAssignment()` mặc định gọi `stripAnswers()`, bỏ
`answer` và `explain`. Chỉ truyền `includeAnswers: true` cho giáo viên, hoặc cho học sinh
**sau khi** đã có bài nộp. Nếu không làm vậy thì đáp án nằm sẵn trong JSON trả về — mở
DevTools là thấy, bài kiểm tra thành vô nghĩa.

**3. Client gửi index đáp án rác.** Khi chấm, server chỉ nhận đáp án cho câu có thật và
index nằm trong khoảng phương án hợp lệ; ngoài khoảng thì bỏ qua, không tính điểm.

Ngoài ra `submissions` có `UNIQUE (assignment_id, student_id)` và route `submit` kiểm tra
bài nộp cũ trước, nên không nộp lại được. Quá `due_at` cũng bị chặn ở server, không chỉ ẩn
nút trên UI.

### Đề bài dùng lại cấu trúc quiz của bài học

`assignments.questions` cùng shape với `lessons.quiz`, nên `cleanQuiz()` trong
[server/validate.js](server/validate.js) và component [Quiz.jsx](src/components/Quiz.jsx)
dùng lại được nguyên vẹn — không phát sinh định dạng câu hỏi thứ hai.

Khi giáo viên lấy đề từ một bài học, câu hỏi được **sao chép** vào `assignments.questions`
thay vì tham chiếu tới `lessons`. Nhờ vậy admin sửa bài học về sau không làm đổi đề đã giao
cho học sinh.

`Quiz.jsx` phục vụ hai ngữ cảnh qua props: mặc định là quiz trong bài học (tự lưu vào
`ProgressContext`, làm lại tuỳ ý); truyền `onSubmit` + `allowRetry={false}` +
`revealAnswers={false}` thì thành đề kiểm tra. `revealAnswers` là bắt buộc vì trước khi
nộp `q.answer` không tồn tại — tô màu đúng/sai lúc đó sẽ sai toàn bộ.

## Tiến độ học tập

Thiết kế **hybrid** trong [ProgressContext](src/context/ProgressContext.jsx):

- Khách chưa đăng nhập: chỉ `localStorage`, y như trước — vào là học được ngay.
- Đã đăng nhập: `done` và `quiz` được đẩy thêm lên server, vì dashboard giáo viên đọc từ
  bảng `progress`. `favorites` / `notes` / `cards` / `streak` mang tính cá nhân nên **không**
  đồng bộ.

`localStorage` vẫn là nguồn hiển thị (ghi lạc quan) nên UI không phải chờ mạng; lỗi mạng
chỉ làm mất đồng bộ tạm thời chứ không làm hỏng trang.

Ngay sau khi đăng nhập, `POST /api/progress/merge` gộp tiến độ đang có ở máy lên server.
Phép gộp dùng `ON CONFLICT` so sánh tỉ lệ `score/total` và **chỉ nâng, không hạ** điểm tốt
nhất, nên chạy lại nhiều lần vẫn an toàn và làm lại bài tệ hơn không xoá mất điểm cũ.

Hai chi tiết dễ sai đã xử lý:

- Quyết định gọi API phải nằm **ngoài** updater của `setState`. React gọi updater hai lần
  ở StrictMode để phát hiện hàm không thuần, đặt side-effect bên trong sẽ gửi request trùng.
- `node:sqlite` **không có** `db.transaction()` (đó là API của better-sqlite3). Dùng
  `withTransaction()` trong [server/db.js](server/db.js) — tự phát `BEGIN`/`COMMIT`/`ROLLBACK`.

### Migration

`CREATE TABLE IF NOT EXISTS` không thêm cột vào bảng đã tồn tại, nên
[server/db.js](server/db.js) kiểm tra `PRAGMA table_info` và `ALTER TABLE` bổ sung cột
còn thiếu. `backfillChapters()` gom các bài chưa có chương vào một "Chương 1" mặc định
cho từng cặp (môn, lớp) — chạy tự động khi khởi động server, an toàn khi chạy lại nhiều lần.

**`admins` → `users`** (`migrateIdentity()`): đổi tên bảng, đổi `sessions.admin_id` và
`audit_log.admin_id` thành `user_id`, rồi thêm `role`/`email`/`grade`/`disabled`. Ba điểm
đáng lưu ý:

1. Migration phải chạy **trước** khối `CREATE TABLE`. Nếu chạy sau, khối
   `CREATE TABLE IF NOT EXISTS admins` sẽ tạo lại một bảng `admins` rỗng và session trỏ
   về bảng sai.
2. `ALTER TABLE ... RENAME TO` với `foreign_keys = ON` **tự cập nhật** mệnh đề
   `REFERENCES` ở bảng khác, nên không mất ràng buộc khoá ngoại.
3. Hàng đang có đều là quản trị viên, nên ngay sau khi thêm cột `role` chúng được gán
   `'admin'`; mặc định `'student'` chỉ áp dụng cho người đăng ký sau này.

`email` không thể đặt `UNIQUE` qua `ALTER TABLE ADD COLUMN`, nên tính duy nhất được bảo
đảm bằng **partial unique index** `idx_users_email ... WHERE email IS NOT NULL` — nhiều
tài khoản không khai email vẫn hợp lệ.

## Luồng người học

| Route | Trang | Nội dung |
|---|---|---|
| `/` | Home | Tổng quan, tìm kiếm nhanh |
| `/lop` | Grades | 3 cấp học → 12 khối lớp |
| `/lop/:grade` | GradeDetail | Danh sách môn của khối lớp đó |
| `/lop/:grade/:subjectId` | GradeDetail | **Mục lục theo chương** của môn đó |
| `/bai-hoc/:lessonId` | Lesson | Nội dung bài: lý thuyết, KaTeX, ghi chú cá nhân |
| `/flashcard` | FlashcardsPage | Lật thẻ, đánh dấu đã nhớ / cần ôn |
| `/trac-nghiem` | QuizPage | Chấm điểm, giải thích đáp án |
| `/tien-do` | Dashboard | Vòng tiến độ, chuỗi ngày học, xuất/nhập JSON |

### Luồng giáo viên

| Route | Trang | Chức năng |
|---|---|---|
| `/giao-vien` | TeacherClasses | Danh sách lớp, tạo lớp mới |
| `/giao-vien/lop/:classId` | TeacherClassDetail | 3 tab: tổng quan · đề bài · học sinh |
| `/giao-vien/lop/:classId/de/moi` | TeacherAssignmentEditor | Soạn đề, hoặc nhập câu hỏi từ bài học |
| `/giao-vien/de/:assignmentId` | TeacherAssignmentEditor | Sửa đề |
| `/giao-vien/de/:assignmentId/bai-nop` | TeacherSubmissions | Bài nộp + câu nào sai nhiều |

### Luồng học sinh

| Route | Trang | Chức năng |
|---|---|---|
| `/lop-hoc` | StudentClasses | Nhập mã lớp, lớp đã tham gia, bài chưa làm |
| `/bai-kiem-tra` | StudentAssignments | Toàn bộ bài được giao, đã nộp / chưa nộp |
| `/bai-kiem-tra/:assignmentId` | TakeAssignment | Làm bài, xem điểm và giải thích sau khi nộp |

Hai khu này dùng chung `PublicShell` (navbar + footer) với phần người học, nên giáo viên và
học sinh vẫn tìm kiếm, đổi theme và tra lý thuyết bình thường. `ROLE_NAV` trong
[Navbar.jsx](src/components/Navbar.jsx) thêm mục menu tương ứng vai trò.

Mục lục chương do `SubjectToc` trong [src/pages/GradeDetail.jsx](src/pages/GradeDetail.jsx)
render: mỗi chương là một card, bài học đánh số `chương.bài` (1.1, 1.2…) như sách giáo khoa.
Bài chưa gán chương hiện ở cuối mục "Bài chưa phân chương" để không bị ẩn mất.

Toàn bộ nội dung công khai tải **một lần** qua `GET /api/content` rồi cache trong
[ContentContext](src/context/ContentContext.jsx); điều hướng hoàn toàn phía client.
Tiến độ học tập lưu `localStorage`, không đồng bộ lên server.

## Luồng quản trị

| Route | Trang | Chức năng |
|---|---|---|
| `/dang-nhap` · `/dang-ky` | Login · Register | Đăng nhập / đăng ký cho **cả 3 vai trò** |
| `/admin/dashboard` | AdminDashboard | Thống kê + lịch sử hoạt động |
| `/admin/khung-noi-dung` | AdminOutline | **Tạo khung nội dung hàng loạt** + cây chương |
| `/admin/bai-hoc` | AdminLessons | Danh sách bài: lọc, tìm, đổi trạng thái |
| `/admin/bai-hoc/moi` · `/:id` | AdminLessonEditor | Soạn nội dung bài |
| `/admin/mon-hoc` | AdminSubjects | Sửa môn học (tên, icon, màu, khối lớp) |
| `/admin/import-export` | AdminImportExport | Sao lưu / khôi phục JSON |
| `/admin/tai-khoan` | AdminAccount | Đổi mật khẩu |

### Cách admin thêm nội dung

Tách làm hai giai đoạn, khớp với cách người ta thực sự soạn giáo trình:

**Giai đoạn 1 — dựng khung** (`/admin/khung-noi-dung`)

Chọn lớp + môn, rồi dán mục lục dạng text:

```
Chương 1: Mệnh đề và tập hợp
  Mệnh đề toán học
  Tập hợp và các phép toán
Chương 2: Bất phương trình
  - Bất phương trình bậc nhất hai ẩn
  - Hệ bất phương trình
```

Dòng sát lề = một chương. Dòng thụt vào (2 dấu cách, Tab, hoặc bắt đầu bằng `-`) = một bài
thuộc chương ngay trên. Bấm **Xem trước** để kiểm tra cây trước khi ghi, **Tạo khung** để
tạo thật — bài sinh ra ở trạng thái `draft`, chưa có nội dung.

Mục đã tồn tại được **bỏ qua** thay vì báo lỗi, nên dán lại mục lục đã sửa/bổ sung vẫn an toàn.

**Giai đoạn 2 — viết nội dung** (`/admin/bai-hoc/:id`)

Mỗi bài có 5 tab:

- `⚡ Dán hàng loạt` — dán nội dung theo cú pháp rút gọn, parse ra toàn bộ block một lần
- `🧱 Sửa từng khối` — thêm/xoá/sắp xếp từng block
- `🗂 Flashcard` · `❓ Trắc nghiệm` — soạn thẻ và câu hỏi
- `👁 Xem trước` — render đúng như người học thấy

Cú pháp dán ([src/lib/parseContent.js](src/lib/parseContent.js)): `#` tiêu đề mục,
`$$…$$` công thức, `|…|` bảng, `- ` danh sách, `1. ` các bước, `!tip`/`!warn`/`!info`
hộp ghi chú, `VD:` + `= ` ví dụ có lời giải, `=== FLASHCARD ===` và `=== QUIZ ===` phân đoạn.
`serializeLesson()` là hàm ngược — mở bài đã lưu về lại dạng text để sửa nhanh.

Viết xong bấm **Lưu và xuất bản** thì bài mới hiện ở khu người học.

## API

### Công khai

```
GET  /api/content          → toàn bộ subjects + chapters + lessons đã xuất bản
GET  /api/lessons/:id      → một bài (dùng cho deep-link)
GET  /api/health
```

### Xác thực

```
GET  /api/auth/me                → { user } hoặc { user: null }
POST /api/auth/register          { username, password, displayName, role, email?, grade? }
POST /api/auth/login             { username, password }
POST /api/auth/logout
POST /api/auth/change-password   { currentPassword, newPassword }
```

Session-based: cookie `httpOnly` + `SameSite`, revoke được ngay bằng cách xoá dòng trong
`sessions` — đơn giản và an toàn hơn JWT cho hệ thống này.

`register` đăng nhập luôn sau khi tạo tài khoản để người dùng không phải nhập lại.
Tên đăng nhập được chuẩn hoá về **chữ thường** ở cả `register` và `login`, nên không
phân biệt hoa/thường.

### Quản trị (yêu cầu đăng nhập)

```
GET    /api/admin/meta                     → grades, tiers, gradeSubjects, blockTypes, catalog
GET    /api/admin/stats                    → thống kê tổng quan
GET    /api/admin/audit                    → 60 hoạt động gần nhất

GET    /api/admin/chapters                  ?subject=&grade=
GET    /api/admin/chapters/:id              → chương + danh sách bài trong chương
POST   /api/admin/chapters
PUT    /api/admin/chapters/:id
DELETE /api/admin/chapters/:id              → chặn nếu chương còn bài
PATCH  /api/admin/chapters/reorder          { items: [{ id, sortOrder }] }
POST   /api/admin/chapters/outline          { subjectId, grade, outline, dryRun }

GET    /api/admin/lessons                   ?subject=&grade=&chapter=&status=&q=
GET    /api/admin/lessons/:id
POST   /api/admin/lessons
PUT    /api/admin/lessons/:id
PATCH  /api/admin/lessons/:id/status        { status }
DELETE /api/admin/lessons/:id
POST   /api/admin/lessons/import            { lessons, overwrite }
GET    /api/admin/lessons-export            ?subject=&grade=&status=

GET    /api/admin/subjects
POST   /api/admin/subjects
PUT    /api/admin/subjects/:id
DELETE /api/admin/subjects/:id
```

Validate tập trung ở [server/validate.js](server/validate.js): làm sạch từng block theo
loại, kiểm tra môn có thuộc chương trình của khối lớp (`GRADE_SUBJECTS`), chương có đúng
cặp (môn, lớp), và chặn xuất bản bài chưa có nội dung lý thuyết.

## Chạy dự án

```bash
npm install
npm run dev      # API :3001 + web :5173
npm run build    # build frontend vào dist/
npm start        # production: 1 cổng phục vụ cả API và web
```

Đăng nhập admin lần đầu: server tự tạo tài khoản và in mật khẩu ra terminal, đổi ngay
tại `/admin/tai-khoan`.

## Việc còn có thể làm

- Kéo–thả sắp xếp chương và bài (API `PATCH /chapters/reorder` đã sẵn, thiếu UI)
- Toast notification thay `alert()` trong AdminSubjects / AdminLessons
- Code-split bundle (hiện 616 kB, chủ yếu do KaTeX)
- Mở rộng cú pháp dán để một lần dán được nhiều bài (`=== BAI: … ===`)
