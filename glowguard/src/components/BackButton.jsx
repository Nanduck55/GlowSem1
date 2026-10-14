import { useLocation, useNavigate } from 'react-router-dom'

// Back button for the Admin and Beauty Consultant portals.
//
// It goes up one level in the URL instead of using the browser history, so it
// still works after a refresh or when a page was opened directly:
//   /admin/users/5               -> /admin/users
//   /consultant/rules/5/edit     -> /consultant/rules/5
//   /consultant/curation/new     -> /consultant/curation
//
// It is hidden on the top-level list pages (/admin/users, /consultant/rules,
// /consultant/curation) because there is nowhere to go back to.

const ACCENTS = {
  green: 'hover:bg-[#f1f5ee]',
  plum: 'hover:bg-[#f7e6f0]',
}

export default function BackButton({ accent = 'green' }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const segments = pathname.split('/').filter(Boolean)

  // [area, list] = top level, e.g. ['admin', 'users']
  if (segments.length <= 2) return null

  const parent = '/' + segments.slice(0, -1).join('/')

  return (
    <button
      type="button"
      onClick={() => navigate(parent)}
      aria-label="Go back"
      className={`
        mb-4 sm:mb-5
        inline-flex items-center gap-1.5
        px-4 py-1.5
        rounded-lg
        bg-white border border-[#1f2a24]
        text-black text-sm font-medium
        transition
        ${ACCENTS[accent] || ACCENTS.green}
      `}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        <path d="m15 5-7 7 7 7" />
      </svg>
      <span>Back</span>
    </button>
  )
}
