import { severityTone, TONE_LABEL } from '../api/severityTone'

// One safety message = one card. The colour follows the rule's severity:
// Potential Conflict (orange), Caution (coral) or Info (green).
export default function SafetyCard({ rule, children }) {
  const tone = severityTone(rule.severity)
  return (
    <div className={`sev-card sev-${tone}`} role={tone === 'info' ? 'note' : 'alert'}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="sev-badge">{TONE_LABEL[tone]}</span>
        {rule.a && rule.b && (
          <span className="text-xs font-bold sev-text">
            {rule.a} + {rule.b}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-xs leading-relaxed sev-text">{rule.message}</p>
      {children}
    </div>
  )
}