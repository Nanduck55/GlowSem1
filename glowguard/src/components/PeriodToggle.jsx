// Sliding AM / PM switch (same look as the one on the Tracker page), plus a
// small AM / PM / Both tag for recommendation cards.

export default function PeriodToggle({ value, onChange }) {
    const isAM = value === 'AM'

    return (
        <button
            type="button"
            onClick={() => onChange(isAM ? 'PM' : 'AM')}
            aria-label={`Showing ${value} products. Switch to ${isAM ? 'PM' : 'AM'}`}
            className={`
        relative w-[76px] h-[32px] shrink-0 rounded-full overflow-hidden
        transition-colors duration-300 focus:outline-none
        ${isAM ? 'bg-[#e9b15f]' : 'bg-[#2d258f]'}
      `}
        >
            <span
                className={`
          absolute inset-0 flex items-center text-[13px] font-normal text-white
          transition-all duration-300
          ${isAM ? 'justify-end pr-3' : 'justify-start pl-3'}
        `}
            >
                {value}
            </span>

            <span
                className={`
          absolute top-[2px] w-[28px] h-[28px] rounded-full bg-[#f8f7ef]
          border border-[#e5e1d5] shadow-[0_1px_4px_rgba(0,0,0,0.12)]
          flex items-center justify-center text-[15px] text-[#2b2b2b]
          transition-all duration-300 ease-in-out
          ${isAM ? 'left-[2px]' : 'left-[46px]'}
        `}
            >
                {isAM ? '☀' : '🌙'}
            </span>
        </button>
    )
}

// Recommendations saved before this feature have no value: treat them as "Both".
export const recTime = (rec) => (['AM', 'PM', 'Both'].includes(rec?.timeOfDay) ? rec.timeOfDay : 'Both')

const TAG_STYLE = {
    AM: 'bg-[#fdecc4] text-[#7a5200]',
    PM: 'bg-[#e0dcff] text-[#2d258f]',
    Both: 'bg-[#d8ecd9] text-[#1f4d36]',
}

export function TimeTag({ rec, className = '' }) {
    const t = recTime(rec)
    return (
        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${TAG_STYLE[t]} ${className}`}>
            {t}
        </span>
    )
}