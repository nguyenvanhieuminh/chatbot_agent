/**
 * Bang mau cho mon hoc.
 *
 * QUAN TRONG: Tailwind quet class trong ma nguon, nen moi chuoi class phai
 * xuat hien nguyen van o day. DB chi luu KHOA mau ('indigo', 'rose'...),
 * khong luu chuoi class - neu khong Tailwind se khong sinh CSS tuong ung.
 */
export const PALETTE = {
  indigo: {
    label: 'Chàm',
    accent: 'from-indigo-500 to-blue-500',
    tint: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
    dot: 'bg-indigo-500',
  },
  sky: {
    label: 'Xanh trời',
    accent: 'from-sky-500 to-cyan-500',
    tint: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  emerald: {
    label: 'Ngọc lục',
    accent: 'from-emerald-500 to-teal-500',
    tint: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  lime: {
    label: 'Xanh lá',
    accent: 'from-lime-500 to-green-500',
    tint: 'bg-lime-50 text-lime-700 dark:bg-lime-500/10 dark:text-lime-300',
    dot: 'bg-lime-500',
  },
  rose: {
    label: 'Hồng đỏ',
    accent: 'from-rose-500 to-pink-500',
    tint: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  amber: {
    label: 'Hổ phách',
    accent: 'from-amber-500 to-orange-500',
    tint: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  teal: {
    label: 'Xanh mòng',
    accent: 'from-teal-500 to-cyan-600',
    tint: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300',
    dot: 'bg-teal-500',
  },
  violet: {
    label: 'Tím',
    accent: 'from-violet-500 to-purple-500',
    tint: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  fuchsia: {
    label: 'Cánh sen',
    accent: 'from-fuchsia-500 to-pink-600',
    tint: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
    dot: 'bg-fuchsia-500',
  },
  cyan: {
    label: 'Lơ',
    accent: 'from-cyan-500 to-blue-500',
    tint: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300',
    dot: 'bg-cyan-500',
  },
  orange: {
    label: 'Cam',
    accent: 'from-orange-500 to-red-500',
    tint: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  pink: {
    label: 'Hồng',
    accent: 'from-pink-500 to-rose-500',
    tint: 'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300',
    dot: 'bg-pink-500',
  },
  slate: {
    label: 'Xám',
    accent: 'from-slate-500 to-slate-700',
    tint: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300',
    dot: 'bg-slate-500',
  },
}

export const PALETTE_KEYS = Object.keys(PALETTE)

export function palette(key) {
  return PALETTE[key] ?? PALETTE.indigo
}
