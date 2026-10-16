/**
 * Bo phan tich "dan hang loat" cho trang admin.
 *
 * Bien mot khoi van ban theo cu phap rut gon thanh { blocks, flashcards, quiz }
 * de admin khong phai bam tung khoi mot. Co ca ham nguoc (serializeLesson)
 * nen bai da luu van mo lai duoc o che do dan.
 */

export const SYNTAX_HELP = [
  { code: '# Tiêu đề mục', desc: 'Tiêu đề trong bài (heading)' },
  { code: 'Một đoạn văn bình thường', desc: 'Đoạn văn' },
  { code: '- ý thứ nhất', desc: 'Danh sách gạch đầu dòng' },
  { code: '1. bước thứ nhất', desc: 'Danh sách các bước (đánh số)' },
  { code: '$$ \\frac{a}{b} $$', desc: 'Công thức hiển thị riêng một dòng' },
  { code: '~ chú thích cho công thức', desc: 'Chú thích, đặt ngay dưới công thức' },
  { code: '| Cột A | Cột B |', desc: 'Bảng — dòng thứ hai là |---|---|' },
  { code: '\\|', desc: 'Dấu | là nội dung, không tách cột (trong $…$ thì khỏi cần)' },
  { code: '!tip Tiêu đề | Nội dung', desc: 'Hộp mẹo (xanh)' },
  { code: '!warn Tiêu đề | Nội dung', desc: 'Hộp cảnh báo (vàng)' },
  { code: '!info Tiêu đề | Nội dung', desc: 'Hộp ghi nhớ (xanh dương)' },
  { code: 'VD: đề bài của ví dụ', desc: 'Mở một ví dụ' },
  { code: '= bước giải', desc: 'Bước giải của ví dụ phía trên' },
  { code: '@ Tiêu đề', desc: 'Đặt tiêu đề cho khối ngay bên dưới' },
  { code: '?? Cột trái | Cột phải', desc: 'Mở khối so sánh hai cột' },
  { code: '< ý cột trái', desc: 'Một ý của cột bên trái' },
  { code: '> ý cột phải', desc: 'Một ý của cột bên phải' },
  { code: '=== FLASHCARD ===', desc: 'Bắt đầu phần thẻ ghi nhớ' },
  { code: 'Mặt trước :: Mặt sau', desc: 'Một thẻ ghi nhớ' },
  { code: '=== QUIZ ===', desc: 'Bắt đầu phần trắc nghiệm' },
  { code: 'Q: Nội dung câu hỏi?', desc: 'Một câu hỏi' },
  { code: '*B) phương án đúng', desc: 'Dấu * ở đầu = đáp án đúng' },
  { code: '> giải thích đáp án', desc: 'Lời giải thích cho câu hỏi' },
]

export const SAMPLE_INPUT = `# 1. Định nghĩa
Đạo hàm của hàm số $f$ tại $x_0$ là giới hạn của tỉ số số gia.
$$ f'(x_0)=\\lim_{\\Delta x \\to 0}\\frac{f(x_0+\\Delta x)-f(x_0)}{\\Delta x} $$
~ Ý nghĩa hình học: hệ số góc của tiếp tuyến tại $M(x_0; f(x_0))$.

# 2. Quy tắc cần nhớ
- $(uv)' = u'v + uv'$
- $\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v-uv'}{v^2}$

| Hàm số | Đạo hàm |
|---|---|
| $x^n$ | $nx^{n-1}$ |
| $\\sin x$ | $\\cos x$ |

!warn Lỗi thường gặp | Nhớ sai thứ tự tử số của thương — đúng là $u'v - uv'$.

@ Đồng biến vs. Nghịch biến
?? Đồng biến trên $K$ | Nghịch biến trên $K$
< $f'(x) > 0$ với mọi $x \\in K$
< Đồ thị đi lên từ trái sang phải
> $f'(x) < 0$ với mọi $x \\in K$
> Đồ thị đi xuống từ trái sang phải

@ Quy trình khảo sát
1. Tìm tập xác định.
2. Tính $f'(x)$ và giải $f'(x)=0$.
3. Lập bảng biến thiên rồi kết luận.

VD: Tìm cực trị của $y = x^3 - 3x^2 + 2$.
= $y' = 3x^2 - 6x = 3x(x-2)$
= $y' = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$
= Cực đại tại $x=0$ ($y=2$), cực tiểu tại $x=2$ ($y=-2$).

=== FLASHCARD ===
Ý nghĩa hình học của $f'(x_0)$? :: Hệ số góc của tiếp tuyến tại điểm $M(x_0; f(x_0))$.
Đạo hàm của thương $\\left(\\dfrac{u}{v}\\right)'$ :: $\\dfrac{u'v - uv'}{v^2}$

=== QUIZ ===
Q: Đạo hàm của $y = x^3 - 3x + 1$ là:
*A) $3x^2 - 3$
B) $3x^2 - 3x$
C) $x^2 - 3$
> Áp dụng $(x^n)' = nx^{n-1}$ cho từng hạng tử.

Q: Hàm số đồng biến trên khoảng $K$ khi:
A) $f'(x) < 0$ trên $K$
*B) $f'(x) > 0$ trên $K$
> Dấu của đạo hàm cấp một quyết định tính đơn điệu.`

const SECTION_RE = /^===\s*(flashcard|the ghi nho|thẻ ghi nhớ|quiz|trac nghiem|trắc nghiệm|ly thuyet|lý thuyết|theory)\s*===$/i

/* ------------------------------ O trong bang ------------------------------ */

/** So dau $ chua bi escape — le nghia la admin go thieu mot dau. */
function hasBalancedMath(s) {
  let n = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '$' && s[i - 1] !== '\\') n++
  }
  return n % 2 === 0
}

/**
 * Tach mot dong bang thanh cac o.
 *
 * Dau | KHONG tach cot khi:
 *  - nam giua hai dau $ — de go duoc $|x|$, $P(A|B)$ ma khong hong bang;
 *  - duoc escape bang \| — cho truong hop | nam ngoai cong thuc.
 *
 * Trong cong thuc, \| duoc giu nguyen vi do la ki hieu chuan (norm) cua LaTeX.
 * Neu so dau $ tren dong la so le thi bo qua luat cong thuc, vi nhieu kha nang
 * admin go thieu $ chu khong phai dang viet mot o co dau |.
 */
function splitCells(line) {
  const s = line.trim()
  const mathAware = hasBalancedMath(s)
  const cells = []
  let buf = ''
  let inMath = false

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (!inMath && ch === '\\' && s[i + 1] === '|') {
      buf += '|'
      i++
    } else if (mathAware && ch === '$') {
      inMath = !inMath
      buf += ch
    } else if (ch === '|' && !inMath) {
      cells.push(buf.trim())
      buf = ''
    } else {
      buf += ch
    }
  }
  cells.push(buf.trim())

  // `| a | b |` sinh ra mot o rong o moi dau — do la hai dau | vien cua bang
  if (cells.length && cells[0] === '') cells.shift()
  if (cells.length && cells[cells.length - 1] === '') cells.pop()
  return cells
}

/** Nguoc voi splitCells: escape dau | nam ngoai cong thuc. */
function escapeCell(value) {
  const s = String(value ?? '')
  const mathAware = hasBalancedMath(s)
  let out = ''
  let inMath = false

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (mathAware && ch === '$' && s[i - 1] !== '\\') {
      inMath = !inMath
      out += ch
    } else if (ch === '|' && !inMath) {
      out += '\\|'
    } else {
      out += ch
    }
  }
  return out
}

function sectionKind(line) {
  const m = line.trim().match(SECTION_RE)
  if (!m) return null
  const key = m[1].toLowerCase()
  if (key.startsWith('q') || key.includes('trac') || key.includes('trắc')) return 'quiz'
  if (key.startsWith('f') || key.includes('ghi nh')) return 'cards'
  return 'theory'
}

/* --------------------------- Phan ly thuyet --------------------------- */

/** Cac khoi co truong `title` trong schema — chi nhung khoi nay nhan duoc `@`. */
const TITLED_BLOCKS = new Set(['note', 'steps', 'compare', 'example'])

function parseTheory(lines, warnings) {
  const blocks = []
  let i = 0

  // Tieu de tu dong `@ ...`, gan vao khoi ngay sau do roi xoa.
  let pendingTitle = ''

  const flushInto = (block) => {
    if (!block) return
    if (pendingTitle) {
      if (TITLED_BLOCKS.has(block.type)) {
        if (!block.title) block.title = pendingTitle
      } else {
        warnings.push(`Tiêu đề "@ ${pendingTitle}" bị bỏ: khối ${block.type} không có tiêu đề riêng.`)
      }
      pendingTitle = ''
    }
    blocks.push(block)
  }

  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.trim()

    // Dong trong — khong xoa pendingTitle, de viet duoc `@ ...` roi cach dong
    if (!line) {
      i++
      continue
    }

    // Tieu de cho khoi ngay ben duoi: @ ...
    const titleMatch = line.match(/^@\s+(.+)$/)
    if (titleMatch) {
      if (pendingTitle) warnings.push(`Có hai dòng "@" liên tiếp; bỏ "${pendingTitle}".`)
      pendingTitle = titleMatch[1].trim()
      i++
      continue
    }

    // So sanh hai cot: ?? Cot trai | Cot phai, roi cac dong < (trai) / > (phai)
    if (/^\?\?/.test(line)) {
      const sides = splitCells(line.replace(/^\?\?\s*/, ''))
      i++
      const left = { title: sides[0] ?? '', items: [] }
      const right = { title: sides[1] ?? '', items: [] }
      while (i < lines.length && /^[<>]\s*/.test(lines[i].trim())) {
        const l = lines[i].trim()
        const side = l.startsWith('<') ? left : right
        side.items.push(l.slice(1).trim())
        i++
      }
      if (!left.items.length && !right.items.length) {
        warnings.push(`Khối so sánh "${sides.join(' | ')}" chưa có ý nào (thêm dòng < hoặc >).`)
      }
      flushInto({ type: 'compare', left, right })
      continue
    }

    // Tieu de: # ... hoac ## ...
    if (/^#{1,4}\s+/.test(line)) {
      flushInto({ type: 'heading', text: line.replace(/^#{1,4}\s+/, '').trim() })
      i++
      continue
    }

    // Cong thuc: $$ ... $$ (mot dong hoac nhieu dong)
    if (line.startsWith('$$')) {
      let latex = ''
      if (line.endsWith('$$') && line.length > 4) {
        latex = line.slice(2, -2).trim()
        i++
      } else {
        latex = line.slice(2).trim()
        i++
        while (i < lines.length && !lines[i].trim().endsWith('$$')) {
          latex += '\n' + lines[i].trim()
          i++
        }
        if (i < lines.length) {
          latex += '\n' + lines[i].trim().replace(/\$\$$/, '')
          i++
        } else {
          warnings.push('Có một công thức $$ chưa được đóng lại bằng $$.')
        }
      }
      const block = { type: 'formula', latex: latex.trim() }
      // Chu thich dat ngay duoi: ~ ...
      if (i < lines.length && lines[i].trim().startsWith('~')) {
        block.caption = lines[i].trim().replace(/^~\s*/, '')
        i++
      }
      flushInto(block)
      continue
    }

    // Hop ghi nho: !tip / !warn / !info  [Tieu de |] Noi dung
    const noteMatch = line.match(/^!(tip|warn|info|note|luu\s*y|meo)\s+(.*)$/i)
    if (noteMatch) {
      const key = noteMatch[1].toLowerCase().replace(/\s+/g, '')
      const variant = key === 'warn' || key === 'luuy' ? 'warn' : key === 'tip' || key === 'meo' ? 'tip' : 'info'
      const rest = noteMatch[2]
      const pipe = rest.indexOf('|')
      const block =
        pipe > -1
          ? { type: 'note', variant, title: rest.slice(0, pipe).trim(), text: rest.slice(pipe + 1).trim() }
          : { type: 'note', variant, text: rest.trim() }
      if (!block.text) warnings.push(`Hộp "!${key}" chưa có nội dung.`)
      flushInto(block)
      i++
      continue
    }

    // Vi du: VD: de bai, theo sau la cac dong bat dau bang =
    const exMatch = line.match(/^(?:VD|Ví dụ|Vi du)\s*:\s*(.*)$/i)
    if (exMatch) {
      const problem = exMatch[1].trim()
      i++
      const solution = []
      while (i < lines.length && /^=\s*/.test(lines[i].trim())) {
        solution.push(lines[i].trim().replace(/^=\s*/, ''))
        i++
      }
      flushInto({ type: 'example', problem, solution })
      continue
    }

    // Bang markdown: | a | b |
    if (line.startsWith('|')) {
      const headers = splitCells(line)
      i++
      // Bo qua dong phan cach |---|---|
      if (i < lines.length && /^\|[\s:-]*\|/.test(lines[i].trim())) i++
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const row = splitCells(lines[i])
        if (row.length > headers.length) {
          warnings.push(
            `Bảng "${headers.join(' | ')}": một dòng có ${row.length} ô nhưng bảng chỉ có ${headers.length} cột — phần dư bị bỏ. Nếu dấu | là nội dung thì viết \\| hoặc đặt trong $…$.`,
          )
        }
        rows.push(headers.map((_, c) => row[c] ?? ''))
        i++
      }
      if (rows.length) flushInto({ type: 'table', headers, rows })
      else warnings.push(`Bảng "${headers.join(' | ')}" chưa có dòng dữ liệu nào.`)
      continue
    }

    // Danh sach danh so -> steps
    if (/^\d+[.)]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''))
        i++
      }
      flushInto({ type: 'steps', items })
      continue
    }

    // Danh sach gach dau dong -> list
    if (/^[-*+]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ''))
        i++
      }
      flushInto({ type: 'list', items })
      continue
    }

    // Con lai: doan van (gop cac dong lien tiep thanh mot doan)
    const paragraph = [line]
    i++
    while (i < lines.length) {
      const nxt = lines[i].trim()
      if (
        !nxt ||
        /^#{1,4}\s+/.test(nxt) ||
        nxt.startsWith('$$') ||
        nxt.startsWith('|') ||
        nxt.startsWith('~') ||
        /^!(tip|warn|info|note)/i.test(nxt) ||
        /^(?:VD|Ví dụ|Vi du)\s*:/i.test(nxt) ||
        /^[-*+]\s+/.test(nxt) ||
        /^\d+[.)]\s+/.test(nxt) ||
        /^@\s+/.test(nxt) ||
        /^\?\?/.test(nxt)
      ) {
        break
      }
      paragraph.push(nxt)
      i++
    }
    flushInto({ type: 'text', text: paragraph.join(' ') })
  }

  if (pendingTitle) {
    warnings.push(`Dòng "@ ${pendingTitle}" không có khối nào bên dưới để gắn tiêu đề.`)
  }

  return blocks
}

/* --------------------------- Phan flashcard --------------------------- */

function parseCards(lines, warnings) {
  const cards = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const sep = line.includes('::') ? '::' : line.includes(' | ') ? ' | ' : null
    if (!sep) {
      warnings.push(`Thẻ "${line.slice(0, 40)}…" thiếu dấu :: giữa mặt trước và mặt sau.`)
      continue
    }
    const idx = line.indexOf(sep)
    const front = line.slice(0, idx).trim()
    const back = line.slice(idx + sep.length).trim()
    if (!front || !back) {
      warnings.push(`Thẻ "${line.slice(0, 40)}…" thiếu một mặt.`)
      continue
    }
    cards.push({ front, back })
  }
  return cards
}

/* ----------------------------- Phan quiz ----------------------------- */

function parseQuiz(lines, warnings) {
  const quiz = []
  let current = null

  const push = () => {
    if (!current) return
    if (!current.options.length) {
      warnings.push(`Câu hỏi "${current.question.slice(0, 40)}…" chưa có phương án nào.`)
    } else if (current.answer < 0) {
      warnings.push(
        `Câu hỏi "${current.question.slice(0, 40)}…" chưa đánh dấu đáp án đúng (thêm dấu * trước phương án).`,
      )
      current.answer = 0
      quiz.push(current)
    } else {
      quiz.push(current)
    }
    current = null
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    const qMatch = line.match(/^(?:Q|Câu|Cau)\s*\d*\s*[:.)]\s*(.*)$/i)
    if (qMatch) {
      push()
      current = { question: qMatch[1].trim(), options: [], answer: -1, explain: '' }
      continue
    }

    // Giai thich
    if (line.startsWith('>')) {
      if (current) current.explain = line.replace(/^>\s*/, '')
      continue
    }

    // Phuong an: [*]A) noi dung  |  [*]- noi dung  |  [*]noi dung
    const optMatch = line.match(/^(\*?)\s*(?:[A-Ha-h][).]|[-•])?\s*(.+)$/)
    if (current && optMatch) {
      const isAnswer = optMatch[1] === '*'
      const text = optMatch[2].trim()
      if (!text) continue
      if (isAnswer) current.answer = current.options.length
      current.options.push(text)
      continue
    }

    warnings.push(`Bỏ qua dòng không hiểu trong phần quiz: "${line.slice(0, 40)}…"`)
  }
  push()
  return quiz
}

/* ------------------------------ Dau vao ------------------------------ */

/**
 * @param {string} input
 * @returns {{ blocks: any[], flashcards: any[], quiz: any[], warnings: string[] }}
 */
export function parsePastedContent(input) {
  const warnings = []
  const lines = String(input ?? '').replace(/\r\n?/g, '\n').split('\n')

  const sections = { theory: [], cards: [], quiz: [] }
  let currentSection = 'theory'
  for (const line of lines) {
    const kind = sectionKind(line)
    if (kind) {
      currentSection = kind === 'cards' ? 'cards' : kind === 'quiz' ? 'quiz' : 'theory'
      continue
    }
    sections[currentSection].push(line)
  }

  return {
    blocks: parseTheory(sections.theory, warnings),
    flashcards: parseCards(sections.cards, warnings),
    quiz: parseQuiz(sections.quiz, warnings),
    warnings,
  }
}

/* --------------------------- Ham nguoc lai --------------------------- */

/** Bien mot bai da luu tro lai cu phap dan, de sua nhanh bang van ban. */
export function serializeLesson({ blocks = [], flashcards = [], quiz = [] }) {
  const out = []

  for (const b of blocks) {
    switch (b.type) {
      case 'heading':
        out.push(`# ${b.text}`, '')
        break
      case 'text':
        out.push(b.text, '')
        break
      case 'list':
        out.push(...b.items.map((it) => `- ${it}`), '')
        break
      case 'steps':
        if (b.title) out.push(`@ ${b.title}`)
        out.push(...b.items.map((it, i) => `${i + 1}. ${it}`), '')
        break
      case 'formula':
        out.push(`$$ ${b.latex} $$`)
        if (b.caption) out.push(`~ ${b.caption}`)
        out.push('')
        break
      case 'table':
        out.push(`| ${b.headers.map(escapeCell).join(' | ')} |`)
        out.push(`|${b.headers.map(() => '---').join('|')}|`)
        out.push(...b.rows.map((r) => `| ${r.map(escapeCell).join(' | ')} |`), '')
        break
      case 'note':
        out.push(`!${b.variant ?? 'info'} ${b.title ? b.title + ' | ' : ''}${b.text}`, '')
        break
      case 'example':
        if (b.title) out.push(`@ ${b.title}`)
        out.push(`VD: ${b.problem}`)
        out.push(...(b.solution ?? []).map((s) => `= ${s}`), '')
        break
      case 'compare':
        if (b.title) out.push(`@ ${b.title}`)
        out.push(`?? ${escapeCell(b.left?.title ?? '')} | ${escapeCell(b.right?.title ?? '')}`)
        out.push(...(b.left?.items ?? []).map((s) => `< ${s}`))
        out.push(...(b.right?.items ?? []).map((s) => `> ${s}`), '')
        break
      default:
        break
    }
  }

  if (flashcards.length) {
    out.push('=== FLASHCARD ===')
    out.push(...flashcards.map((c) => `${c.front} :: ${c.back}`), '')
  }

  if (quiz.length) {
    out.push('=== QUIZ ===')
    for (const q of quiz) {
      out.push(`Q: ${q.question}`)
      q.options.forEach((o, i) => {
        const letter = String.fromCharCode(65 + i)
        out.push(`${i === q.answer ? '*' : ''}${letter}) ${o}`)
      })
      if (q.explain) out.push(`> ${q.explain}`)
      out.push('')
    }
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
