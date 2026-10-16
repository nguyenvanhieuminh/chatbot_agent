const base = 'h-5 w-5'

function Svg({ children, className = base, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconSun = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </Svg>
)

export const IconMoon = (p) => (
  <Svg {...p}>
    <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Svg>
)

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
)

export const IconBook = (p) => (
  <Svg {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
    <path d="M8 7h8M8 11h6" />
  </Svg>
)

export const IconCards = (p) => (
  <Svg {...p}>
    <rect x="3" y="6" width="12" height="14" rx="2" />
    <path d="M8 3h9a2 2 0 0 1 2 2v11" />
  </Svg>
)

export const IconQuiz = (p) => (
  <Svg {...p}>
    <path d="M9.1 9a3 3 0 1 1 4.5 2.6c-.9.6-1.6 1.1-1.6 2.4" />
    <circle cx="12" cy="18" r=".6" fill="currentColor" />
    <circle cx="12" cy="12" r="9" />
  </Svg>
)

export const IconChart = (p) => (
  <Svg {...p}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 20v-6M13 20V8M18 20v-9" />
  </Svg>
)

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Svg>
)

export const IconStar = ({ filled = false, className = base, ...p }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...p}
  >
    <path d="m12 3.5 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9z" />
  </svg>
)

export const IconInfo = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.6v.4" />
  </Svg>
)

export const IconBulb = (p) => (
  <Svg {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9V15h7v-1.1A6 6 0 0 0 12 3z" />
  </Svg>
)

export const IconAlert = (p) => (
  <Svg {...p}>
    <path d="M10.6 3.8 2.5 18a1.6 1.6 0 0 0 1.4 2.4h16.2a1.6 1.6 0 0 0 1.4-2.4L13.4 3.8a1.6 1.6 0 0 0-2.8 0z" />
    <path d="M12 9v4M12 16.6v.4" />
  </Svg>
)

export const IconPencil = (p) => (
  <Svg {...p}>
    <path d="M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16z" />
    <path d="m14.5 5.5 4 4" />
  </Svg>
)

export const IconChevronDown = (p) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)

export const IconArrowLeft = (p) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
)

export const IconArrowRight = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
)

export const IconNote = (p) => (
  <Svg {...p}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6M8 13h7M8 17h5" />
  </Svg>
)

export const IconFlame = (p) => (
  <Svg {...p}>
    <path d="M12 22c4 0 6-2.7 6-6 0-4.5-4-6-4-10-3 1.5-4 4-4 6-1.5-.7-2-2-2-3-1.3 1.6-2 3.6-2 5.7C6 19 8.7 22 12 22z" />
  </Svg>
)

export const IconClose = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)

export const IconRefresh = (p) => (
  <Svg {...p}>
    <path d="M20 11A8 8 0 0 0 6.3 6.3L4 8.5" />
    <path d="M4 4v4.5h4.5" />
    <path d="M4 13a8 8 0 0 0 13.7 4.7L20 15.5" />
    <path d="M20 20v-4.5h-4.5" />
  </Svg>
)

export const IconMenu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
)
