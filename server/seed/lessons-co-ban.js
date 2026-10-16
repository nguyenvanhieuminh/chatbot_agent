const R = String.raw

/**
 * Bai hoc demo cho lop 1 - 9, de khung dieu huong theo lop khong bi trong.
 * Noi dung that nhung ngan; admin se bo sung dan qua trang /admin.
 */
const lessons = [
  /* ------------------------------- Lop 1 ------------------------------- */
  {
    id: 'toan.l1.cong-tru-trong-10',
    subjectId: 'toan',
    grade: 1,
    minutes: 8,
    title: 'Phép cộng, phép trừ trong phạm vi 10',
    summary: 'Cách đếm thêm, đếm bớt và bảng cộng trừ trong phạm vi 10.',
    keywords: ['phép cộng', 'phép trừ', 'phạm vi 10', 'đếm thêm', 'đếm bớt'],
    blocks: [
      { type: 'heading', text: '1. Phép cộng là đếm thêm' },
      {
        type: 'text',
        text: 'Có 3 quả táo, thêm 2 quả nữa thì được 5 quả. Ta viết: $3 + 2 = 5$. Dấu $+$ đọc là **cộng**, dấu $=$ đọc là **bằng**.',
      },
      {
        type: 'list',
        items: [
          'Đổi chỗ hai số vẫn được kết quả như cũ: $3 + 2 = 2 + 3$.',
          'Một số cộng với $0$ thì bằng chính nó: $7 + 0 = 7$.',
        ],
      },
      { type: 'heading', text: '2. Phép trừ là đếm bớt' },
      {
        type: 'text',
        text: 'Có 5 cái kẹo, cho đi 2 cái thì còn 3 cái. Ta viết: $5 - 2 = 3$.',
      },
      {
        type: 'note',
        variant: 'tip',
        title: 'Mẹo cộng cho tròn 10',
        text: 'Học thuộc các cặp số cộng lại bằng 10: 1–9, 2–8, 3–7, 4–6, 5–5. Nhớ được các cặp này thì tính nhanh hơn nhiều.',
      },
      {
        type: 'example',
        problem: 'Trong giỏ có 4 quả cam, mẹ cho thêm 3 quả. Hỏi trong giỏ có mấy quả cam?',
        solution: ['Thêm vào nên làm phép cộng.', '$4 + 3 = 7$.', 'Vậy trong giỏ có 7 quả cam.'],
      },
    ],
    flashcards: [
      { front: '$6 + 4 = ?$', back: '$10$' },
      { front: '$9 - 3 = ?$', back: '$6$' },
      { front: 'Một số cộng với 0 thì bằng bao nhiêu?', back: 'Bằng chính số đó. Ví dụ $8 + 0 = 8$.' },
      { front: 'Các cặp số cộng lại bằng 10', back: '1–9, 2–8, 3–7, 4–6, 5–5.' },
    ],
    quiz: [
      {
        question: '$5 + 4 = ?$',
        options: ['$8$', '$9$', '$10$', '$1$'],
        answer: 1,
        explain: 'Đếm thêm 4 từ số 5: 6, 7, 8, 9.',
      },
      {
        question: '$10 - 6 = ?$',
        options: ['$3$', '$4$', '$5$', '$16$'],
        answer: 1,
        explain: 'Đếm bớt 6 từ số 10 còn lại 4.',
      },
      {
        question: 'Số nào cộng với 7 thì được 10?',
        options: ['$2$', '$3$', '$4$', '$17$'],
        answer: 1,
        explain: '$7 + 3 = 10$.',
      },
    ],
  },
  {
    id: 'tiengviet.l1.am-van',
    subjectId: 'tiengviet',
    grade: 1,
    minutes: 8,
    title: 'Âm, vần và cách đánh vần',
    summary: 'Phân biệt nguyên âm – phụ âm, cấu tạo tiếng và cách đánh vần một tiếng.',
    keywords: ['âm', 'vần', 'đánh vần', 'nguyên âm', 'phụ âm', 'thanh điệu', 'tiếng'],
    blocks: [
      { type: 'heading', text: '1. Tiếng gồm những phần nào?' },
      {
        type: 'text',
        text: 'Một tiếng thường gồm **âm đầu** + **vần** + **thanh điệu**. Ví dụ tiếng *bàn*: âm đầu là *b*, vần là *an*, thanh điệu là dấu huyền.',
      },
      { type: 'heading', text: '2. Nguyên âm và phụ âm' },
      {
        type: 'table',
        headers: ['Loại', 'Gồm những chữ', 'Ghi nhớ'],
        rows: [
          ['Nguyên âm đơn', 'a, ă, â, e, ê, i, o, ô, ơ, u, ư, y', 'Đọc được một mình'],
          ['Phụ âm', 'b, c, d, đ, g, h, k, l, m, n, p, q, r, s, t, v, x', 'Phải ghép với nguyên âm mới đọc được'],
          ['Phụ âm ghép', 'ch, gh, gi, kh, ng, ngh, nh, ph, qu, th, tr', 'Hai hoặc ba chữ ghi một âm'],
        ],
      },
      { type: 'heading', text: '3. Sáu thanh điệu' },
      {
        type: 'list',
        items: [
          'Thanh ngang (không dấu): *ba*',
          'Thanh huyền `\\`: *bà*',
          'Thanh sắc `/`: *bá*',
          'Thanh hỏi `?`: *bả*',
          'Thanh ngã `~`: *bã*',
          'Thanh nặng `.`: *bạ*',
        ],
      },
      {
        type: 'steps',
        title: 'Đánh vần tiếng “trường”',
        items: ['Đọc vần trước: *ương*.', 'Ghép âm đầu: *tr – ương → trương*.', 'Thêm thanh huyền: *trương – huyền → trường*.'],
      },
    ],
    flashcards: [
      { front: 'Một tiếng gồm những phần nào?', back: 'Âm đầu + vần + thanh điệu.' },
      { front: 'Tiếng Việt có mấy thanh điệu?', back: '6 thanh: ngang, huyền, sắc, hỏi, ngã, nặng.' },
      { front: 'Kể 3 phụ âm ghép', back: 'ch, ngh, tr (ngoài ra còn gh, gi, kh, ng, nh, ph, qu, th).' },
    ],
    quiz: [
      {
        question: 'Tiếng “hoa” có âm đầu là:',
        options: ['h', 'o', 'a', 'oa'],
        answer: 0,
        explain: 'Âm đầu là *h*, vần là *oa*, thanh ngang.',
      },
      {
        question: 'Chữ nào sau đây là nguyên âm?',
        options: ['b', 'ê', 'ng', 't'],
        answer: 1,
        explain: '*ê* là nguyên âm, đọc được một mình.',
      },
    ],
  },

  /* ------------------------------- Lop 2 ------------------------------- */
  {
    id: 'toan.l2.bang-nhan-chia',
    subjectId: 'toan',
    grade: 2,
    minutes: 9,
    title: 'Bảng nhân, bảng chia 2 và 5',
    summary: 'Hiểu phép nhân là cộng nhiều lần bằng nhau, thuộc bảng nhân – chia 2 và 5.',
    keywords: ['bảng nhân', 'bảng chia', 'phép nhân', 'phép chia', 'nhân 2', 'nhân 5'],
    blocks: [
      { type: 'heading', text: '1. Phép nhân là cộng nhiều lần bằng nhau' },
      {
        type: 'text',
        text: 'Có 3 đĩa, mỗi đĩa 2 quả. Tổng số quả là $2 + 2 + 2 = 6$, viết gọn thành $2 \\times 3 = 6$.',
      },
      { type: 'heading', text: '2. Bảng nhân 2 và bảng nhân 5' },
      {
        type: 'table',
        headers: ['Nhân 2', 'Kết quả', 'Nhân 5', 'Kết quả'],
        rows: [
          ['$2 \\times 1$', '$2$', '$5 \\times 1$', '$5$'],
          ['$2 \\times 2$', '$4$', '$5 \\times 2$', '$10$'],
          ['$2 \\times 3$', '$6$', '$5 \\times 3$', '$15$'],
          ['$2 \\times 4$', '$8$', '$5 \\times 4$', '$20$'],
          ['$2 \\times 5$', '$10$', '$5 \\times 5$', '$25$'],
        ],
      },
      {
        type: 'note',
        variant: 'tip',
        title: 'Nhìn ra quy luật',
        text: 'Kết quả bảng nhân 2 luôn là số chẵn, mỗi bước tăng thêm 2. Kết quả bảng nhân 5 luôn tận cùng bằng 0 hoặc 5, mỗi bước tăng thêm 5.',
      },
      { type: 'heading', text: '3. Phép chia là phép nhân ngược lại' },
      {
        type: 'text',
        text: 'Từ $2 \\times 3 = 6$ ta suy ra ngay $6 : 2 = 3$ và $6 : 3 = 2$. Học thuộc bảng nhân là đã thuộc luôn bảng chia.',
      },
    ],
    flashcards: [
      { front: '$2 \\times 7 = ?$', back: '$14$' },
      { front: '$5 \\times 6 = ?$', back: '$30$' },
      { front: '$20 : 5 = ?$', back: '$4$, vì $5 \\times 4 = 20$.' },
      { front: 'Kết quả bảng nhân 5 có đặc điểm gì?', back: 'Luôn tận cùng bằng 0 hoặc 5.' },
    ],
    quiz: [
      {
        question: '$2 \\times 8 = ?$',
        options: ['$10$', '$16$', '$18$', '$6$'],
        answer: 1,
        explain: '$2 \\times 8 = 8 + 8 = 16$.',
      },
      {
        question: '$35 : 5 = ?$',
        options: ['$6$', '$7$', '$8$', '$30$'],
        answer: 1,
        explain: 'Vì $5 \\times 7 = 35$.',
      },
    ],
  },

  /* ------------------------------- Lop 3 ------------------------------- */
  {
    id: 'toan.l3.chu-vi-dien-tich',
    subjectId: 'toan',
    grade: 3,
    minutes: 10,
    title: 'Chu vi và diện tích hình chữ nhật, hình vuông',
    summary: 'Công thức tính chu vi – diện tích hai hình cơ bản và cách phân biệt hai đại lượng này.',
    keywords: ['chu vi', 'diện tích', 'hình chữ nhật', 'hình vuông', 'đơn vị đo'],
    blocks: [
      { type: 'heading', text: '1. Công thức' },
      {
        type: 'table',
        headers: ['Hình', 'Chu vi', 'Diện tích'],
        rows: [
          ['Hình chữ nhật (dài $a$, rộng $b$)', '$P = (a + b) \\times 2$', '$S = a \\times b$'],
          ['Hình vuông (cạnh $a$)', '$P = a \\times 4$', '$S = a \\times a$'],
        ],
      },
      {
        type: 'note',
        variant: 'warn',
        title: 'Đừng lẫn chu vi với diện tích',
        text: 'Chu vi là độ dài đường bao quanh hình, đơn vị là cm, m… Diện tích là phần mặt bên trong hình, đơn vị là cm², m². Nhìn đơn vị trong câu trả lời là biết mình có làm đúng loại hay không.',
      },
      {
        type: 'example',
        problem: 'Một hình chữ nhật có chiều dài 8 cm, chiều rộng 5 cm. Tính chu vi và diện tích.',
        solution: [
          'Chu vi: $P = (8 + 5) \\times 2 = 13 \\times 2 = 26$ (cm).',
          'Diện tích: $S = 8 \\times 5 = 40$ (cm²).',
        ],
      },
    ],
    flashcards: [
      { front: 'Chu vi hình chữ nhật', back: '$P = (\\text{dài} + \\text{rộng}) \\times 2$' },
      { front: 'Diện tích hình vuông cạnh $a$', back: '$S = a \\times a$' },
      { front: 'Đơn vị của diện tích', back: 'cm², dm², m²… (có số 2 ở trên).' },
    ],
    quiz: [
      {
        question: 'Hình vuông cạnh 6 cm có chu vi là:',
        options: ['$12$ cm', '$24$ cm', '$36$ cm', '$36$ cm²'],
        answer: 1,
        explain: '$P = 6 \\times 4 = 24$ cm.',
      },
      {
        question: 'Hình chữ nhật dài 7 m, rộng 3 m có diện tích là:',
        options: ['$20$ m²', '$21$ m²', '$10$ m²', '$21$ m'],
        answer: 1,
        explain: '$S = 7 \\times 3 = 21$ m².',
      },
    ],
  },

  /* ------------------------------- Lop 4 ------------------------------- */
  {
    id: 'khoahoc.l4.nuoc-va-vong-tuan-hoan',
    subjectId: 'khoahoc',
    grade: 4,
    minutes: 9,
    title: 'Nước và vòng tuần hoàn của nước',
    summary: 'Ba thể của nước, sự bay hơi – ngưng tụ và vòng tuần hoàn của nước trong tự nhiên.',
    keywords: ['nước', 'bay hơi', 'ngưng tụ', 'vòng tuần hoàn', 'ba thể', 'đông đặc'],
    blocks: [
      { type: 'heading', text: '1. Ba thể của nước' },
      {
        type: 'table',
        headers: ['Thể', 'Ví dụ', 'Đặc điểm'],
        rows: [
          ['Rắn', 'Nước đá, tuyết', 'Có hình dạng nhất định'],
          ['Lỏng', 'Nước trong cốc, nước mưa', 'Không có hình dạng nhất định, chảy được'],
          ['Khí', 'Hơi nước', 'Không nhìn thấy, lan toả khắp nơi'],
        ],
      },
      { type: 'heading', text: '2. Hai hiện tượng chính' },
      {
        type: 'list',
        items: [
          '**Bay hơi**: nước lỏng nhận nhiệt và biến thành hơi nước. Trời càng nắng, gió càng nhiều thì nước bay hơi càng nhanh.',
          '**Ngưng tụ**: hơi nước gặp lạnh biến trở lại thành nước lỏng — đó là lí do thành cốc nước đá bị “ướt”.',
          '**Đông đặc**: nước lỏng ở $0°$C trở thành nước đá; **nóng chảy** là quá trình ngược lại.',
        ],
      },
      { type: 'heading', text: '3. Vòng tuần hoàn của nước' },
      {
        type: 'steps',
        items: [
          'Nước ở biển, sông, hồ **bay hơi** lên cao.',
          'Hơi nước gặp lạnh **ngưng tụ** thành những hạt nước nhỏ, tạo thành mây.',
          'Các hạt nước trong mây gộp lại, nặng dần và rơi xuống thành **mưa**.',
          'Nước mưa chảy về sông, biển hoặc ngấm xuống đất — rồi lại bay hơi, lặp lại vòng mới.',
        ],
      },
      {
        type: 'note',
        variant: 'info',
        title: 'Vì sao gọi là “tuần hoàn”?',
        text: 'Vì lượng nước trên Trái Đất gần như không đổi, nó chỉ chuyển từ nơi này sang nơi khác và đổi thể liên tục theo một vòng lặp.',
      },
    ],
    flashcards: [
      { front: 'Ba thể của nước', back: 'Rắn (nước đá), lỏng (nước), khí (hơi nước).' },
      { front: 'Bay hơi là gì?', back: 'Nước lỏng nhận nhiệt và biến thành hơi nước.' },
      { front: 'Vì sao thành cốc nước đá bị ướt?', back: 'Hơi nước trong không khí gặp thành cốc lạnh nên ngưng tụ thành nước.' },
      { front: 'Mây được tạo thành thế nào?', back: 'Hơi nước bay lên cao gặp lạnh, ngưng tụ thành vô số hạt nước nhỏ.' },
    ],
    quiz: [
      {
        question: 'Hiện tượng nước biến thành hơi nước gọi là:',
        options: ['Ngưng tụ', 'Bay hơi', 'Đông đặc', 'Nóng chảy'],
        answer: 1,
        explain: 'Lỏng → khí là bay hơi.',
      },
      {
        question: 'Mưa hình thành là do:',
        options: [
          'Hơi nước bay lên cao',
          'Các hạt nước trong mây gộp lại đủ nặng rồi rơi xuống',
          'Nước đóng băng trên mặt đất',
          'Gió thổi nước từ biển vào',
        ],
        answer: 1,
        explain: 'Hạt nước trong mây lớn dần, nặng hơn không khí nên rơi xuống thành mưa.',
      },
    ],
  },

  /* ------------------------------- Lop 5 ------------------------------- */
  {
    id: 'toan.l5.phan-so',
    subjectId: 'toan',
    grade: 5,
    minutes: 12,
    title: 'Phân số và bốn phép tính với phân số',
    summary: 'Rút gọn, quy đồng và cộng – trừ – nhân – chia phân số.',
    keywords: ['phân số', 'quy đồng', 'rút gọn', 'cộng phân số', 'chia phân số', 'mẫu số'],
    blocks: [
      { type: 'heading', text: '1. Tính chất cơ bản' },
      {
        type: 'text',
        text: 'Nhân (hoặc chia) cả tử số và mẫu số với cùng một số khác $0$ thì được phân số bằng phân số đã cho: $\\dfrac{2}{3} = \\dfrac{4}{6} = \\dfrac{6}{9}$.',
      },
      {
        type: 'list',
        items: [
          '**Rút gọn**: chia cả tử và mẫu cho cùng một số. $\\dfrac{8}{12} = \\dfrac{2}{3}$ (chia cả hai cho 4).',
          '**Quy đồng**: đưa hai phân số về cùng mẫu số trước khi cộng hoặc trừ.',
        ],
      },
      { type: 'heading', text: '2. Bốn phép tính' },
      {
        type: 'formula',
        latex: R`\frac{a}{b}+\frac{c}{b}=\frac{a+c}{b} \qquad \frac{a}{b}\times\frac{c}{d}=\frac{a\times c}{b\times d} \qquad \frac{a}{b}:\frac{c}{d}=\frac{a}{b}\times\frac{d}{c}`,
      },
      {
        type: 'note',
        variant: 'warn',
        title: 'Hai lỗi hay gặp nhất',
        text: 'Cộng phân số mà cộng luôn cả mẫu số ($\\dfrac{1}{2}+\\dfrac{1}{3} \\ne \\dfrac{2}{5}$ — phải quy đồng thành $\\dfrac{3}{6}+\\dfrac{2}{6}=\\dfrac{5}{6}$). Và chia phân số mà quên đảo ngược phân số thứ hai.',
      },
      {
        type: 'example',
        problem: 'Tính $\\dfrac{3}{4} + \\dfrac{2}{5}$.',
        solution: [
          'Quy đồng mẫu số, mẫu chung là $20$.',
          '$\\dfrac{3}{4} = \\dfrac{15}{20}$ và $\\dfrac{2}{5} = \\dfrac{8}{20}$.',
          '$\\dfrac{15}{20} + \\dfrac{8}{20} = \\dfrac{23}{20}$.',
        ],
      },
    ],
    flashcards: [
      { front: 'Muốn cộng hai phân số khác mẫu, làm gì trước?', back: 'Quy đồng mẫu số, rồi cộng hai tử số và giữ nguyên mẫu.' },
      { front: 'Quy tắc chia hai phân số', back: 'Nhân phân số thứ nhất với phân số thứ hai **đảo ngược**: $\\dfrac{a}{b} : \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c}$.' },
      { front: 'Rút gọn $\\dfrac{9}{12}$', back: '$\\dfrac{3}{4}$ (chia cả tử và mẫu cho 3).' },
    ],
    quiz: [
      {
        question: '$\\dfrac{1}{2} + \\dfrac{1}{4} = ?$',
        options: ['$\\dfrac{2}{6}$', '$\\dfrac{3}{4}$', '$\\dfrac{1}{6}$', '$\\dfrac{2}{4}$'],
        answer: 1,
        explain: 'Quy đồng: $\\dfrac{2}{4} + \\dfrac{1}{4} = \\dfrac{3}{4}$.',
      },
      {
        question: '$\\dfrac{2}{3} : \\dfrac{4}{5} = ?$',
        options: ['$\\dfrac{8}{15}$', '$\\dfrac{5}{6}$', '$\\dfrac{10}{12}$', '$\\dfrac{6}{20}$'],
        answer: 1,
        explain: '$\\dfrac{2}{3} \\times \\dfrac{5}{4} = \\dfrac{10}{12} = \\dfrac{5}{6}$.',
      },
    ],
  },

  /* ------------------------------- Lop 6 ------------------------------- */
  {
    id: 'toan.l6.so-nguyen',
    subjectId: 'toan',
    grade: 6,
    minutes: 11,
    title: 'Số nguyên và quy tắc dấu',
    summary: 'Tập hợp số nguyên, thứ tự trên trục số và quy tắc dấu khi cộng, trừ, nhân, chia.',
    keywords: ['số nguyên', 'số âm', 'quy tắc dấu', 'giá trị tuyệt đối', 'trục số'],
    blocks: [
      { type: 'heading', text: '1. Tập hợp số nguyên' },
      {
        type: 'text',
        text: '$\\mathbb{Z} = \\{\\dots, -3, -2, -1, 0, 1, 2, 3, \\dots\\}$ gồm số nguyên âm, số $0$ và số nguyên dương. Trên trục số, số bên phải luôn lớn hơn số bên trái, nên mọi số nguyên âm đều nhỏ hơn $0$ và nhỏ hơn mọi số nguyên dương.',
      },
      { type: 'heading', text: '2. Giá trị tuyệt đối' },
      {
        type: 'text',
        text: '$|a|$ là khoảng cách từ điểm $a$ đến điểm $0$ trên trục số, nên $|a| \\ge 0$ luôn đúng. Ví dụ $|-7| = 7$ và $|7| = 7$.',
      },
      { type: 'heading', text: '3. Quy tắc dấu' },
      {
        type: 'table',
        headers: ['Phép tính', 'Quy tắc', 'Ví dụ'],
        rows: [
          ['Cộng hai số cùng dấu', 'Cộng hai giá trị tuyệt đối, giữ dấu chung', '$(-3) + (-5) = -8$'],
          ['Cộng hai số khác dấu', 'Trừ hai giá trị tuyệt đối, lấy dấu của số có GTTĐ lớn hơn', '$(-7) + 4 = -3$'],
          ['Trừ', 'Đổi thành cộng với số đối: $a - b = a + (-b)$', '$5 - 8 = 5 + (-8) = -3$'],
          ['Nhân / chia cùng dấu', 'Kết quả **dương**', '$(-4) \\times (-3) = 12$'],
          ['Nhân / chia khác dấu', 'Kết quả **âm**', '$(-4) \\times 3 = -12$'],
        ],
      },
      {
        type: 'note',
        variant: 'tip',
        title: 'Mẹo nhớ dấu khi nhân',
        text: '“Cùng dấu ra dương, khác dấu ra âm.” Với một dãy phép nhân, đếm số lượng dấu âm: chẵn thì kết quả dương, lẻ thì kết quả âm.',
      },
    ],
    flashcards: [
      { front: '$|-9| = ?$', back: '$9$ — giá trị tuyệt đối luôn không âm.' },
      { front: '$(-6) \\times (-7) = ?$', back: '$42$ — hai số cùng dấu, kết quả dương.' },
      { front: 'Quy tắc trừ số nguyên', back: '$a - b = a + (-b)$ — đổi thành cộng với số đối.' },
      { front: 'Dãy nhân có 3 dấu âm thì kết quả dấu gì?', back: 'Âm, vì số dấu âm là số lẻ.' },
    ],
    quiz: [
      {
        question: '$(-8) + 3 = ?$',
        options: ['$-11$', '$-5$', '$5$', '$11$'],
        answer: 1,
        explain: 'Khác dấu: $8 - 3 = 5$, lấy dấu của $-8$ ⇒ $-5$.',
      },
      {
        question: '$(-2) \\times (-3) \\times (-4) = ?$',
        options: ['$24$', '$-24$', '$-9$', '$9$'],
        answer: 1,
        explain: 'Có 3 dấu âm (số lẻ) nên kết quả âm: $-24$.',
      },
      {
        question: 'Số nào lớn nhất?',
        options: ['$-10$', '$-1$', '$0$', '$-100$'],
        answer: 2,
        explain: 'Mọi số nguyên âm đều nhỏ hơn $0$.',
      },
    ],
  },

  /* ------------------------------- Lop 7 ------------------------------- */
  {
    id: 'khtn.l7.nguyen-tu-phan-tu',
    subjectId: 'khtn',
    grade: 7,
    minutes: 10,
    title: 'Nguyên tử, nguyên tố và phân tử',
    summary: 'Phân biệt nguyên tử – nguyên tố – phân tử, đơn chất – hợp chất và cách đọc công thức hoá học.',
    keywords: ['nguyên tử', 'nguyên tố', 'phân tử', 'đơn chất', 'hợp chất', 'công thức hoá học'],
    blocks: [
      { type: 'heading', text: '1. Ba khái niệm dễ lẫn' },
      {
        type: 'table',
        headers: ['Khái niệm', 'Định nghĩa', 'Ví dụ'],
        rows: [
          ['Nguyên tử', 'Hạt vô cùng nhỏ, trung hoà về điện, gồm hạt nhân và các electron', 'Một nguyên tử O'],
          ['Nguyên tố hoá học', 'Tập hợp những nguyên tử **cùng số proton**', 'Nguyên tố oxi'],
          ['Phân tử', 'Hạt gồm một số nguyên tử liên kết với nhau, thể hiện đầy đủ tính chất của chất', 'Phân tử $\\text{O}_2$, $\\text{H}_2\\text{O}$'],
        ],
      },
      { type: 'heading', text: '2. Đơn chất và hợp chất' },
      {
        type: 'compare',
        left: {
          title: 'Đơn chất',
          items: ['Do **một** nguyên tố tạo nên.', 'Ví dụ: $\\text{O}_2$, $\\text{H}_2$, Fe, Cu.'],
        },
        right: {
          title: 'Hợp chất',
          items: [
            'Do **hai hoặc nhiều** nguyên tố tạo nên.',
            'Ví dụ: $\\text{H}_2\\text{O}$, $\\text{NaCl}$, $\\text{CO}_2$.',
          ],
        },
      },
      { type: 'heading', text: '3. Đọc công thức hoá học' },
      {
        type: 'text',
        text: 'Trong $\\text{H}_2\\text{SO}_4$: chỉ số nhỏ phía dưới cho biết số nguyên tử của nguyên tố đứng trước nó. Vậy một phân tử gồm 2 nguyên tử H, 1 nguyên tử S và 4 nguyên tử O.',
      },
      {
        type: 'note',
        variant: 'warn',
        title: 'Phân biệt chỉ số và hệ số',
        text: '$3\\text{H}_2\\text{O}$: số **3** đứng trước là hệ số, cho biết có 3 phân tử nước. Số **2** nhỏ phía dưới là chỉ số, cho biết mỗi phân tử có 2 nguyên tử H. Tổng cộng có 6 nguyên tử H.',
      },
    ],
    flashcards: [
      { front: 'Nguyên tố hoá học được xác định bởi gì?', back: 'Số proton trong hạt nhân — các nguyên tử cùng số proton thuộc cùng một nguyên tố.' },
      { front: 'Đơn chất khác hợp chất ở điểm nào?', back: 'Đơn chất do 1 nguyên tố tạo nên; hợp chất do 2 nguyên tố trở lên.' },
      { front: 'Trong $\\text{CaCO}_3$ có mấy nguyên tử oxi?', back: '3 nguyên tử oxi.' },
      { front: '$2\\text{H}_2\\text{O}$ có tổng bao nhiêu nguyên tử H?', back: '4 nguyên tử ($2 \\times 2$).' },
    ],
    quiz: [
      {
        question: 'Chất nào sau đây là đơn chất?',
        options: ['$\\text{H}_2\\text{O}$', '$\\text{O}_2$', '$\\text{NaCl}$', '$\\text{CO}_2$'],
        answer: 1,
        explain: '$\\text{O}_2$ chỉ do nguyên tố oxi tạo nên.',
      },
      {
        question: 'Phân tử $\\text{H}_2\\text{SO}_4$ gồm bao nhiêu nguyên tử?',
        options: ['$4$', '$6$', '$7$', '$3$'],
        answer: 2,
        explain: '2 H + 1 S + 4 O = 7 nguyên tử.',
      },
    ],
  },

  /* ------------------------------- Lop 8 ------------------------------- */
  {
    id: 'toan.l8.phuong-trinh-bac-nhat',
    subjectId: 'toan',
    grade: 8,
    minutes: 11,
    title: 'Phương trình bậc nhất một ẩn',
    summary: 'Hai quy tắc biến đổi tương đương, cách giải phương trình bậc nhất và giải bài toán bằng cách lập phương trình.',
    keywords: ['phương trình', 'bậc nhất', 'một ẩn', 'chuyển vế', 'lập phương trình'],
    blocks: [
      { type: 'heading', text: '1. Dạng tổng quát' },
      {
        type: 'formula',
        latex: R`ax+b=0 \quad (a\neq 0) \;\Longrightarrow\; x=-\frac{b}{a}`,
      },
      {
        type: 'list',
        items: [
          'Nếu $a \\ne 0$: phương trình có **đúng một** nghiệm $x = -\\dfrac{b}{a}$.',
          'Nếu $a = 0$ và $b \\ne 0$: phương trình **vô nghiệm**.',
          'Nếu $a = 0$ và $b = 0$: phương trình có **vô số** nghiệm.',
        ],
      },
      { type: 'heading', text: '2. Hai quy tắc biến đổi' },
      {
        type: 'list',
        items: [
          '**Chuyển vế**: chuyển một hạng tử từ vế này sang vế kia và đổi dấu hạng tử đó.',
          '**Nhân / chia hai vế** với cùng một số khác $0$.',
        ],
      },
      { type: 'heading', text: '3. Giải bài toán bằng cách lập phương trình' },
      {
        type: 'steps',
        items: [
          'Chọn ẩn, đặt điều kiện cho ẩn và ghi rõ đơn vị.',
          'Biểu diễn các đại lượng chưa biết khác theo ẩn.',
          'Lập phương trình từ mối quan hệ trong đề bài.',
          'Giải phương trình.',
          'Đối chiếu điều kiện rồi kết luận, trả lời đúng câu hỏi của đề.',
        ],
      },
      {
        type: 'note',
        variant: 'warn',
        title: 'Bước bị bỏ quên nhiều nhất',
        text: 'Bước 5 — đối chiếu điều kiện. Nếu ẩn là số người, số sản phẩm thì nghiệm âm hoặc không nguyên phải loại.',
      },
      {
        type: 'example',
        problem: 'Giải phương trình $3x - 5 = 2x + 4$.',
        solution: [
          'Chuyển $2x$ sang trái, $-5$ sang phải: $3x - 2x = 4 + 5$.',
          '$x = 9$.',
          'Vậy tập nghiệm $S = \\{9\\}$.',
        ],
      },
    ],
    flashcards: [
      { front: 'Nghiệm của $ax + b = 0$ với $a \\ne 0$', back: '$x = -\\dfrac{b}{a}$' },
      { front: 'Khi nào $ax + b = 0$ vô nghiệm?', back: 'Khi $a = 0$ và $b \\ne 0$.' },
      { front: 'Quy tắc chuyển vế', back: 'Chuyển hạng tử sang vế kia thì phải đổi dấu hạng tử đó.' },
      { front: '5 bước giải bài toán bằng cách lập phương trình', back: 'Chọn ẩn + điều kiện → biểu diễn đại lượng → lập phương trình → giải → đối chiếu điều kiện và kết luận.' },
    ],
    quiz: [
      {
        question: 'Nghiệm của phương trình $2x - 6 = 0$ là:',
        options: ['$x = -3$', '$x = 3$', '$x = 12$', '$x = 2$'],
        answer: 1,
        explain: '$2x = 6 \\Rightarrow x = 3$.',
      },
      {
        question: 'Phương trình $0x + 5 = 0$:',
        options: ['Có 1 nghiệm', 'Vô nghiệm', 'Vô số nghiệm', 'Có 2 nghiệm'],
        answer: 1,
        explain: '$a = 0$, $b = 5 \\ne 0$ nên vô nghiệm.',
      },
    ],
  },

  /* ------------------------------- Lop 9 ------------------------------- */
  {
    id: 'toan.l9.he-thuc-viet',
    subjectId: 'toan',
    grade: 9,
    minutes: 12,
    title: 'Phương trình bậc hai và hệ thức Vi-ét',
    summary: 'Công thức nghiệm, biệt thức delta, hệ thức Vi-ét và các ứng dụng thường gặp.',
    keywords: ['phương trình bậc hai', 'delta', 'biệt thức', 'Vi-ét', 'tổng tích hai nghiệm'],
    blocks: [
      { type: 'heading', text: '1. Công thức nghiệm' },
      {
        type: 'formula',
        latex: R`ax^{2}+bx+c=0\ (a\neq 0),\qquad \Delta=b^{2}-4ac,\qquad x_{1,2}=\frac{-b\pm\sqrt{\Delta}}{2a}`,
      },
      {
        type: 'table',
        headers: ['Dấu của $\\Delta$', 'Số nghiệm'],
        rows: [
          ['$\\Delta > 0$', 'Hai nghiệm phân biệt'],
          ['$\\Delta = 0$', 'Nghiệm kép $x = -\\dfrac{b}{2a}$'],
          ['$\\Delta < 0$', 'Vô nghiệm (trong tập số thực)'],
        ],
      },
      { type: 'heading', text: '2. Hệ thức Vi-ét' },
      {
        type: 'formula',
        latex: R`S=x_1+x_2=-\frac{b}{a} \qquad P=x_1x_2=\frac{c}{a}`,
      },
      {
        type: 'list',
        items: [
          'Tìm hai số biết tổng $S$ và tích $P$: chúng là nghiệm của $X^2 - SX + P = 0$ (điều kiện $S^2 - 4P \\ge 0$).',
          'Nhẩm nhanh: nếu $a + b + c = 0$ thì $x_1 = 1$, $x_2 = \\dfrac{c}{a}$. Nếu $a - b + c = 0$ thì $x_1 = -1$, $x_2 = -\\dfrac{c}{a}$.',
          'Hai nghiệm trái dấu $\\iff P < 0$ (khi đó $\\Delta > 0$ tự động thoả).',
          'Hai nghiệm cùng dương $\\iff \\Delta \\ge 0$, $S > 0$ và $P > 0$.',
        ],
      },
      {
        type: 'note',
        variant: 'tip',
        title: 'Vì sao Vi-ét hữu dụng',
        text: 'Rất nhiều bài chỉ hỏi về biểu thức đối xứng của hai nghiệm (như $x_1^2 + x_2^2$ hay $\\dfrac{1}{x_1}+\\dfrac{1}{x_2}$). Dùng $S$ và $P$ thì không cần giải ra nghiệm: $x_1^2 + x_2^2 = S^2 - 2P$.',
      },
      {
        type: 'example',
        problem: 'Cho $x^2 - 5x + 6 = 0$. Tính $x_1^2 + x_2^2$ mà không giải phương trình.',
        solution: [
          '$S = x_1 + x_2 = 5$, $P = x_1x_2 = 6$.',
          '$x_1^2 + x_2^2 = S^2 - 2P = 25 - 12 = 13$.',
        ],
      },
    ],
    flashcards: [
      { front: 'Biệt thức $\\Delta$ của $ax^2+bx+c=0$', back: '$\\Delta = b^2 - 4ac$' },
      { front: 'Hệ thức Vi-ét', back: '$x_1 + x_2 = -\\dfrac{b}{a}$ và $x_1x_2 = \\dfrac{c}{a}$.' },
      { front: 'Điều kiện hai nghiệm trái dấu', back: '$P = \\dfrac{c}{a} < 0$ (tức $a$ và $c$ trái dấu).' },
      { front: '$x_1^2 + x_2^2$ theo $S$ và $P$', back: '$S^2 - 2P$' },
      { front: 'Nhẩm nghiệm khi $a+b+c=0$', back: '$x_1 = 1$, $x_2 = \\dfrac{c}{a}$.' },
    ],
    quiz: [
      {
        question: 'Phương trình $x^2 - 4x + 4 = 0$ có:',
        options: ['Hai nghiệm phân biệt', 'Nghiệm kép', 'Vô nghiệm', 'Vô số nghiệm'],
        answer: 1,
        explain: '$\\Delta = 16 - 16 = 0$ nên có nghiệm kép $x = 2$.',
      },
      {
        question: 'Cho $x^2 - 7x + 10 = 0$. Tổng hai nghiệm bằng:',
        options: ['$-7$', '$7$', '$10$', '$-10$'],
        answer: 1,
        explain: '$x_1 + x_2 = -\\dfrac{b}{a} = -\\dfrac{-7}{1} = 7$.',
      },
      {
        question: 'Phương trình $x^2 + 3x - 10 = 0$ có hai nghiệm:',
        options: ['Cùng dương', 'Cùng âm', 'Trái dấu', 'Vô nghiệm'],
        answer: 2,
        explain: '$P = \\dfrac{c}{a} = -10 < 0$ nên hai nghiệm trái dấu.',
      },
    ],
  },
]

export default lessons
