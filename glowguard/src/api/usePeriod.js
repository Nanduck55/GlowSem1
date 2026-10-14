import { useState } from 'react'

// Remembers the AM / PM toggle so the Routine and Tracker pages open on the
// period you last chose (and stay in sync with each other).
const KEY = 'gg_time_of_day'

export function usePeriod(fallback = 'AM') {
  const [period, setPeriodState] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved === 'AM' || saved === 'PM') return saved
    } catch {
      // Storage blocked — fall back to the default.
    }
    return fallback
  })

  const setPeriod = (value) => {
    setPeriodState(value)
    try {
      localStorage.setItem(KEY, value)
    } catch {
      // Storage full / blocked — the choice just won't persist.
    }
  }

  return [period, setPeriod]
}