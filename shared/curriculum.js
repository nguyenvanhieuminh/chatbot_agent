/**
 * Cau hinh chuong trinh hoc - dung chung cho ca server (seed, validate)
 * va client (dieu huong). Khong import gi de chay duoc o hai phia.
 */

export const TIERS = [
  { id: 'tieu-hoc', name: 'Tiểu học', icon: '🧸', grades: [1, 2, 3, 4, 5] },
  { id: 'thcs', name: 'Trung học cơ sở', icon: '🎒', grades: [6, 7, 8, 9] },
  { id: 'thpt', name: 'Trung học phổ thông', icon: '🎓', grades: [10, 11, 12] },
]

export const GRADES = TIERS.flatMap((t) => t.grades)

export function tierOfGrade(grade) {
  return TIERS.find((t) => t.grades.includes(Number(grade))) ?? null
}

/** Danh muc mon hoc toan he thong. `color` la khoa trong src/lib/palette.js */
export const SUBJECT_CATALOG = [
  {
    id: 'toan',
    name: 'Toán',
    short: 'Toán',
    icon: '📐',
    color: 'indigo',
    order: 1,
    description:
      'Từ phép cộng trừ đầu tiên đến đạo hàm, tích phân và hình học toạ độ — công thức cốt lõi cho cả 12 khối lớp.',
  },
  {
    id: 'tiengviet',
    name: 'Tiếng Việt',
    short: 'T.Việt',
    icon: '✍️',
    color: 'rose',
    order: 2,
    description: 'Âm – vần, từ loại, câu, chính tả và kĩ năng đọc hiểu, viết đoạn ở bậc tiểu học.',
  },
  {
    id: 'nguvan',
    name: 'Ngữ văn',
    short: 'Văn',
    icon: '📖',
    color: 'rose',
    order: 2,
    description: 'Biện pháp tu từ, kĩ năng nghị luận xã hội – văn học và cách phân tích tác phẩm.',
  },
  {
    id: 'tienganh',
    name: 'Tiếng Anh',
    short: 'Anh',
    icon: '🔤',
    color: 'violet',
    order: 3,
    description: 'Ngữ pháp trọng tâm, thì động từ, cấu trúc câu và từ vựng theo chủ đề.',
  },
  {
    id: 'tnxh',
    name: 'Tự nhiên và Xã hội',
    short: 'TN&XH',
    icon: '🌱',
    color: 'lime',
    order: 4,
    description: 'Cơ thể người, cây cối, con vật, gia đình và cộng đồng quanh em.',
  },
  {
    id: 'khoahoc',
    name: 'Khoa học',
    short: 'K.Học',
    icon: '🔬',
    color: 'cyan',
    order: 4,
    description: 'Nước, không khí, ánh sáng, âm thanh, năng lượng và cơ thể con người.',
  },
  {
    id: 'khtn',
    name: 'Khoa học tự nhiên',
    short: 'KHTN',
    icon: '⚗️',
    color: 'emerald',
    order: 4,
    description: 'Môn tích hợp ở THCS: chất và sự biến đổi, năng lượng, vật sống và Trái Đất.',
  },
  {
    id: 'vatli',
    name: 'Vật lí',
    short: 'Lí',
    icon: '⚛️',
    color: 'sky',
    order: 5,
    description: 'Dao động, sóng, điện xoay chiều, nhiệt học và vật lí hạt nhân.',
  },
  {
    id: 'hoahoc',
    name: 'Hoá học',
    short: 'Hoá',
    icon: '🧪',
    color: 'emerald',
    order: 6,
    description:
      'Cấu tạo nguyên tử, liên kết, tốc độ – cân bằng phản ứng, kim loại và hoá hữu cơ cơ bản.',
  },
  {
    id: 'sinhhoc',
    name: 'Sinh học',
    short: 'Sinh',
    icon: '🧬',
    color: 'lime',
    order: 7,
    description: 'Di truyền phân tử, quy luật Mendel, tiến hoá và sinh thái học.',
  },
  {
    id: 'lsdl',
    name: 'Lịch sử và Địa lí',
    short: 'LS&ĐL',
    icon: '🗺️',
    color: 'amber',
    order: 8,
    description: 'Môn tích hợp: các mốc lịch sử lớn và đặc điểm tự nhiên – dân cư các vùng.',
  },
  {
    id: 'lichsu',
    name: 'Lịch sử',
    short: 'Sử',
    icon: '🏛️',
    color: 'amber',
    order: 8,
    description: 'Lịch sử Việt Nam hiện đại và những chuyển biến lớn của thế giới sau 1945.',
  },
  {
    id: 'diali',
    name: 'Địa lí',
    short: 'Địa',
    icon: '🌏',
    color: 'teal',
    order: 9,
    description: 'Vị trí – tự nhiên Việt Nam, dân số, các ngành kinh tế và kĩ năng đọc biểu đồ.',
  },
  {
    id: 'daoduc',
    name: 'Đạo đức',
    short: 'Đ.Đức',
    icon: '🤝',
    color: 'pink',
    order: 10,
    description: 'Bài học về lễ phép, trung thực, giữ gìn vệ sinh và ứng xử với mọi người.',
  },
  {
    id: 'gdcd',
    name: 'Giáo dục công dân',
    short: 'GDCD',
    icon: '⚖️',
    color: 'fuchsia',
    order: 10,
    description: 'Quyền và nghĩa vụ công dân, pháp luật, đạo đức và kĩ năng sống.',
  },
  {
    id: 'gdktpl',
    name: 'Giáo dục kinh tế và pháp luật',
    short: 'KT&PL',
    icon: '⚖️',
    color: 'fuchsia',
    order: 10,
    description: 'Kiến thức kinh tế cơ bản, hệ thống pháp luật và quyền – nghĩa vụ công dân.',
  },
  {
    id: 'tinhoc',
    name: 'Tin học',
    short: 'Tin',
    icon: '💻',
    color: 'slate',
    order: 11,
    description: 'Máy tính, internet an toàn, soạn thảo – bảng tính và tư duy lập trình.',
  },
  {
    id: 'congnghe',
    name: 'Công nghệ',
    short: 'C.Nghệ',
    icon: '🛠️',
    color: 'orange',
    order: 12,
    description: 'Đồ dùng trong gia đình, trồng cây, thiết kế kĩ thuật và an toàn điện.',
  },
]

/** Mon hoc co trong tung khoi lop. */
export const GRADE_SUBJECTS = {
  1: ['toan', 'tiengviet', 'tnxh', 'daoduc', 'tienganh'],
  2: ['toan', 'tiengviet', 'tnxh', 'daoduc', 'tienganh'],
  3: ['toan', 'tiengviet', 'tnxh', 'daoduc', 'tienganh', 'tinhoc', 'congnghe'],
  4: ['toan', 'tiengviet', 'khoahoc', 'lsdl', 'daoduc', 'tienganh', 'tinhoc', 'congnghe'],
  5: ['toan', 'tiengviet', 'khoahoc', 'lsdl', 'daoduc', 'tienganh', 'tinhoc', 'congnghe'],
  6: ['toan', 'nguvan', 'tienganh', 'khtn', 'lsdl', 'gdcd', 'tinhoc', 'congnghe'],
  7: ['toan', 'nguvan', 'tienganh', 'khtn', 'lsdl', 'gdcd', 'tinhoc', 'congnghe'],
  8: ['toan', 'nguvan', 'tienganh', 'khtn', 'lsdl', 'gdcd', 'tinhoc', 'congnghe'],
  9: ['toan', 'nguvan', 'tienganh', 'khtn', 'lsdl', 'gdcd', 'tinhoc', 'congnghe'],
  10: ['toan', 'nguvan', 'tienganh', 'vatli', 'hoahoc', 'sinhhoc', 'lichsu', 'diali', 'gdktpl', 'tinhoc'],
  11: ['toan', 'nguvan', 'tienganh', 'vatli', 'hoahoc', 'sinhhoc', 'lichsu', 'diali', 'gdktpl', 'tinhoc'],
  12: ['toan', 'nguvan', 'tienganh', 'vatli', 'hoahoc', 'sinhhoc', 'lichsu', 'diali', 'gdktpl', 'tinhoc'],
}

export const BLOCK_TYPES = [
  { type: 'heading', label: 'Tiêu đề mục' },
  { type: 'text', label: 'Đoạn văn' },
  { type: 'list', label: 'Danh sách gạch đầu dòng' },
  { type: 'formula', label: 'Công thức (khối)' },
  { type: 'table', label: 'Bảng' },
  { type: 'note', label: 'Hộp ghi nhớ / mẹo / cảnh báo' },
  { type: 'steps', label: 'Các bước' },
  { type: 'compare', label: 'So sánh 2 cột' },
  { type: 'example', label: 'Ví dụ có lời giải' },
]

export const LESSON_STATUS = [
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Bản nháp' },
]

/* -------------------- Multi-content support -------------------- */

export const CONTENT_TYPES = [
  { value: 'k12', label: '📚 Phổ thông', description: 'Lớp 1-12' },
  { value: 'professional', label: '💼 Chuyên môn', description: 'Kỹ năng chuyên môn' },
  { value: 'blog', label: '📝 Blog', description: 'Bài viết, hướng dẫn' },
  { value: 'course', label: '🎓 Khóa học', description: 'Khóa học có cấu trúc' },
]

export const PROFESSIONAL_CATEGORIES = [
  { id: 'web-dev', name: 'Lập trình Web', icon: '💻', color: 'blue' },
  { id: 'mobile-dev', name: 'Lập trình Mobile', icon: '📱', color: 'purple' },
  { id: 'data-science', name: 'Khoa học dữ liệu', icon: '📊', color: 'emerald' },
  { id: 'ai-ml', name: 'AI & Machine Learning', icon: '🤖', color: 'indigo' },
  { id: 'design', name: 'Thiết kế', icon: '🎨', color: 'pink' },
  { id: 'marketing', name: 'Marketing', icon: '📢', color: 'orange' },
  { id: 'business', name: 'Kinh doanh', icon: '💼', color: 'slate' },
  { id: 'productivity', name: 'Năng suất', icon: '⚡', color: 'yellow' },
]

export const BLOG_CATEGORIES = [
  { id: 'tutorial', name: 'Hướng dẫn', icon: '📖' },
  { id: 'tips', name: 'Mẹo & Thủ thuật', icon: '💡' },
  { id: 'career', name: 'Nghề nghiệp', icon: '🚀' },
  { id: 'news', name: 'Tin tức', icon: '📰' },
  { id: 'opinion', name: 'Ý kiến', icon: '💭' },
]

export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: '🌱 Cơ bản', color: 'green' },
  { value: 'intermediate', label: '🔥 Trung bình', color: 'orange' },
  { value: 'advanced', label: '⚡ Nâng cao', color: 'red' },
]
