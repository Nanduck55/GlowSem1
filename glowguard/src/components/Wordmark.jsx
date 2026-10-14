// GlowGuard wordmark: serif, two-tone ("Glow" dark, "Guard" sage).
// tone="light" -> for light backgrounds (dark green + sage)
// tone="dark"  -> for dark backgrounds  (white + light sage)
const COLORS = {
  light: { glow: '#14352a', guard: '#5a6e52' },
  dark: { glow: '#ffffff', guard: '#a8c3a0' },
}

export default function Wordmark({ tone = 'light', className = '' }) {
  const c = COLORS[tone] || COLORS.light
  return (
    <span
      className={`inline-flex items-baseline leading-none tracking-tight ${className}`}
      style={{
        fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
        fontWeight: 600,
      }}
    >
      <span style={{ color: c.glow }}>Glow</span>
      <span style={{ color: c.guard }}>Guard</span>
    </span>
  )
}