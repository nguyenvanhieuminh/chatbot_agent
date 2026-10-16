/**
 * SQLite `datetime('now')` tra ve "YYYY-MM-DD HH:MM:SS" theo gio UTC nhung
 * KHONG co hau to Z. V8 hieu dang co dau cach nay la gio DIA PHUONG, nen phai
 * chuyen thanh ISO chuan truoc khi `new Date()`, khong thi gio hien ra lech
 * theo mui gio nguoi dung.
 *
 * Cac moc thoi gian do server tu sinh bang `new Date().toISOString()` da co
 * san chu 'T' va 'Z' — nhan ra qua dau 'T' va giu nguyen.
 */
export function parseServerDate(value) {
  if (!value) return null
  const iso = value.includes('T') ? value : value.replace(' ', 'T') + 'Z'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDateTime(value, fallback = '—') {
  const d = parseServerDate(value)
  return d ? d.toLocaleString('vi-VN') : fallback
}

export function formatDate(value, fallback = '—') {
  const d = parseServerDate(value)
  return d ? d.toLocaleDateString('vi-VN') : fallback
}

/** Nhan han nop: "Còn 2 ngày" / "Quá hạn 3 giờ" — de hoc sinh uu tien dung bai. */
export function formatDue(value) {
  const d = parseServerDate(value)
  if (!d) return ''
  const diffMs = d.getTime() - Date.now()
  const overdue = diffMs < 0
  const mins = Math.round(Math.abs(diffMs) / 60000)

  let amount
  if (mins < 60) amount = `${mins} phút`
  else if (mins < 60 * 24) amount = `${Math.round(mins / 60)} giờ`
  else amount = `${Math.round(mins / (60 * 24))} ngày`

  return overdue ? `Quá hạn ${amount}` : `Còn ${amount}`
}

export function isOverdue(value) {
  const d = parseServerDate(value)
  return Boolean(d) && d.getTime() < Date.now()
}

/** Doi ISO tu server thanh gia tri cho <input type="datetime-local"> (gio dia phuong). */
export function toDateTimeLocal(value) {
  const d = parseServerDate(value)
  if (!d) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
