import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day

  d.setDate(d.getDate() + diff)
  return d
}

function addDays(date, amount) {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatMonth(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export default function Tracker() {
  const { products, loadRoutine } = useApp()

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [timeOfDay, setTimeOfDay] = useState('AM')
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()))
  const [routines, setRoutines] = useState({})
  const [loading, setLoading] = useState(true)

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) =>
      addDays(weekStart, index)
    )
  }, [weekStart])

  const loadWeek = async () => {
    setLoading(true)

    try {
      const results = await Promise.all(
        days.map(async (date) => {
          const key = dateKey(date)
          const routine = await loadRoutine(key)

          return [key, routine || []]
        })
      )

      setRoutines(Object.fromEntries(results))
    } catch (error) {
      console.error('Unable to load tracker:', error)
      setRoutines({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeek()
  }, [weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  // Routine changes happen on another page / another tab, so refresh
  // whenever this view comes back into focus.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') loadWeek()
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)

    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  // Rows come from the selected date's routine only. Pick another date
  // and the list swaps to whatever was added to that day.
  const filteredProducts = useMemo(() => {
    const routine = routines[selectedDate] || []

    const scheduledIds = new Set(
      routine.map((entry) => String(entry.productId))
    )

    return products.filter((product) => {
      if (!scheduledIds.has(String(product.id))) return false

      const productTime =
        String(product.timeOfDay || '').toUpperCase()

      // 'Both' products belong to the AM *and* PM view.
      if (!productTime || productTime === 'BOTH') return true

      return productTime === timeOfDay
    })
  }, [products, timeOfDay, routines, selectedDate])

  const isCompleted = (productId, date) => {
    const routine = routines[dateKey(date)] || []

    const item = routine.find(
      (entry) => String(entry.productId) === String(productId)
    )

    return item?.completed === true
  }

  const isScheduled = (productId, date) => {
    const routine = routines[dateKey(date)] || []

    return routine.some(
      (entry) => String(entry.productId) === String(productId)
    )
  }

  const shiftWeek = (amount) => {
    setWeekStart((current) => addDays(current, amount))

    // Keep a date selected inside the week being shown.
    setSelectedDate((current) => {
      const [year, month, day] = current.split('-').map(Number)
      const moved = addDays(new Date(year, month - 1, day), amount)

      return dateKey(moved)
    })
  }

  const goPreviousWeek = () => {
    shiftWeek(-7)
  }

  const goNextWeek = () => {
    shiftWeek(7)
  }

  const goToday = () => {
    const today = new Date()

    setWeekStart(startOfWeek(today))
    setSelectedDate(dateKey(today))
  }

  const monthTitle = formatMonth(weekStart)

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#f5f9f6]">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">

        {/* Top controls */}
        <div className="w-full flex justify-end mb-5">
          <button
            type="button"
            onClick={() => setTimeOfDay(timeOfDay === 'AM' ? 'PM' : 'AM')}
            aria-label={`Switch to ${timeOfDay === 'AM' ? 'PM' : 'AM'}`}
            className={`
              relative
              w-[100px] h-[44px]
              rounded-full
              overflow-hidden
              transition-colors duration-300
              focus:outline-none
              ${timeOfDay === 'AM'
                ? 'bg-[#e9b15f]'
                : 'bg-[#2d258f]'
              }
            `}
          >
            {/* AM / PM text */}
            <span
              className={`
                absolute inset-0
                flex items-center
                text-[18px]
                font-normal
                transition-all duration-300
                ${timeOfDay === 'AM'
                  ? 'justify-end pr-5 text-white'
                  : 'justify-start pl-5 text-white'
                }
              `}
            >
              {timeOfDay}
            </span>

            {/* Sliding circle */}
            <span
              className={`
                absolute
                top-[2px]
                w-[40px] h-[40px]
                rounded-full
                bg-[#f8f7ef]
                border border-[#e5e1d5]
                shadow-[0_1px_4px_rgba(0,0,0,0.12)]
                flex items-center justify-center
                text-[21px]
                text-[#2b2b2b]
                transition-all duration-300 ease-in-out
                ${timeOfDay === 'AM'
                  ? 'left-[2px]'
                  : 'left-[58px]'
                }
              `}
            >
              {timeOfDay === 'AM' ? '☀' : '🌙'}
            </span>
          </button>
        </div>

        {/* Header */}
        <div className="
          w-full
          grid
          grid-cols-1
          lg:grid-cols-[180px_minmax(0,1fr)]
          gap-4
          lg:gap-6
          items-end
          mb-5
        ">

          {/* Journey title */}
          <div className="hidden lg:block">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight text-[#202621]">
              Jordan’s
              <br />
              Skin Journey
            </h1>
          </div>

          {/* Month + dates */}
          <div className="w-full min-w-0">

            <div className="flex items-center justify-center gap-3 sm:gap-5 mb-4">

              <button
                type="button"
                onClick={goPreviousWeek}
                aria-label="Previous week"
                className="w-8 h-8 rounded-full bg-[#b5d2ba] text-[#31523b] grid place-items-center hover:bg-[#a4c6aa] transition"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={goToday}
                className="text-xl sm:text-2xl font-semibold text-[#202621] hover:text-[#315c40] transition"
              >
                {monthTitle}
              </button>

              <button
                type="button"
                onClick={goNextWeek}
                aria-label="Next week"
                className="w-8 h-8 rounded-full bg-[#b5d2ba] text-[#31523b] grid place-items-center hover:bg-[#a4c6aa] transition"
              >
                ›
              </button>

            </div>

            <div className="w-full grid grid-cols-7 gap-2 sm:gap-3">
              {days.map((date, index) => {
                const key = dateKey(date)
                const isSelected = selectedDate === key

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                    className={`w-full min-w-0 h-16 sm:h-[72px] rounded-xl border flex flex-col items-center justify-center transition ${isSelected
                      ? 'border-[#315c40] bg-white shadow-[0_2px_8px_rgba(30,60,40,.12)]'
                      : 'border-[#cfd7d1] bg-[#f8faf8] hover:border-[#8ca895] hover:bg-white'
                      }`}
                  >
                    <span className="text-[10px] sm:text-xs text-[#59645d]">
                      {date.getDate()}
                    </span>

                    <span className="text-[10px] sm:text-xs font-medium text-[#29322d]">
                      {DAYS[index]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Mobile title */}
        <div className="w-full lg:hidden mb-5">
          <h1 className="text-xl font-bold leading-tight text-[#202621]">
            Jordan’s
            <br />
            Skin Journey
          </h1>
        </div>

        {/* Tracker */}
        <div className="w-full space-y-3">

          {loading ? (
            <div className="w-full bg-white border border-[#dfe6e1] rounded-xl p-8 text-center text-sm text-gray-500">
              Loading your routine...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="w-full bg-white border border-[#dfe6e1] rounded-xl p-8 text-center">
              <p className="font-semibold text-[#263129]">
                Nothing in your {timeOfDay === 'AM' ? 'morning' : 'night'} routine on this day.
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Add products to {selectedDate} on the Routine page and they’ll appear here.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="w-full bg-white border border-[#d9e0db] rounded-xl shadow-[0_2px_5px_rgba(30,50,35,.08)] overflow-hidden"
              >

                <div className="
                  grid
                  grid-cols-[minmax(120px,0.8fr)_minmax(0,2fr)]
                  sm:grid-cols-[190px_minmax(0,1fr)]
                  lg:grid-cols-[220px_minmax(0,1fr)]
                  items-center
                  gap-2
                  sm:gap-4
                  px-3
                  sm:px-5
                  py-3
                ">

                  {/* Product information */}
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm font-semibold text-[#202621] truncate">
                      {product.name}
                    </h2>

                    {product.actives?.length > 0 ? (
                      <p className="text-[9px] sm:text-[10px] text-[#4e5c53] truncate mt-0.5">
                        Active: {product.actives.join(', ')}
                      </p>
                    ) : null}

                    <p className="text-[9px] sm:text-[10px] text-[#667169] truncate">
                      {product.category}
                    </p>
                  </div>

                  {/* Daily status circles */}
                  <div className="w-full min-w-0 grid grid-cols-7 gap-1.5 sm:gap-2 lg:gap-3">
                    {days.map((date) => {
                      const key = dateKey(date)
                      const completed = isCompleted(product.id, date)
                      const scheduled = isScheduled(product.id, date)
                      const selected = selectedDate === key

                      return (
                        <button
                          key={key}
                          type="button"
                          title={
                            completed
                              ? `${product.name} completed on ${key}`
                              : scheduled
                                ? `${product.name} scheduled but not completed on ${key}`
                                : `${product.name} not scheduled on ${key}`
                          }
                          onClick={() => setSelectedDate(key)}
                          className={`w-full min-w-0 flex items-center justify-center rounded-full p-1 transition ${selected
                            ? 'ring-2 ring-[#b6c8ba] ring-offset-1'
                            : ''
                            }`}
                        >
                          <span
                            className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full border transition ${completed
                              ? 'bg-[#81967b] border-[#73896f] shadow-sm'
                              : scheduled
                                ? 'bg-[#f4f0e7] border-[#d7d0c2]'
                                : 'bg-transparent border-dashed border-[#dde3de]'
                              }`}
                          />
                        </button>
                      )
                    })}
                  </div>

                </div>
              </div>
            ))
          )}

        </div>

        {/* Legend */}
        <div className="
          w-full
          flex
          flex-wrap
          justify-center
          gap-4
          sm:gap-6
          mt-6
          text-[10px]
          sm:text-xs
          text-[#647068]
        ">

          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#81967b] border border-[#73896f]" />
            Complete
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#f4f0e7] border border-[#d7d0c2]" />
            Not Complete
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-transparent border border-dashed border-[#dde3de]" />
            Not Scheduled
          </span>

        </div>

      </div>
    </div>
  )
}