import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import { findClashes, skinTypeKey } from '../api/services'
import Modal from '../components/Modal'
import ProductForm from '../components/ProductForm'

const DAY_MS = 86400000

// Local-time date key (YYYY-MM-DD).
// NOTE: do NOT use toISOString() here — it converts to UTC, so in UTC+8
// every date before 8am would be saved under the previous day and the
// Tracker page (which keys by local time) would never find it.
const fmt = (d) => {
  const x = new Date(d)
  const year = x.getFullYear()
  const month = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const monthLabel = (d) =>
  d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

function startOfWeek(d) {
  const x = new Date(d)
  const day = (x.getDay() + 6) % 7 // Monday = 0
  x.setDate(x.getDate() - day)
  return x
}

export default function Routine() {
  const {
    user,
    products,
    rules,
    loadRoutine,
    addToRoutine,
    toggleComplete,
    removeFromRoutine,
    setPeriodRemoved,
    saveProduct,
    deleteProduct,
    notify,
  } = useApp()

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [selected, setSelected] = useState(new Date())
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [addPicker, setAddPicker] = useState(false)
  const [menuFor, setMenuFor] = useState(null)
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 })

  // AM / PM switch
  const [timeOfDay, setTimeOfDay] = useState(
    new Date().getHours() >= 12 ? 'PM' : 'AM'
  )

  const menuRef = useRef(null)

  // --------------------------------------------------
  // DATE / WEEK
  // --------------------------------------------------

  const dateKey = fmt(selected)

  const week = useMemo(() => {
    const s = startOfWeek(selected)

    return Array.from(
      { length: 7 },
      (_, i) => new Date(s.getTime() + i * DAY_MS)
    )
  }, [selected])

  // --------------------------------------------------
  // LOAD ROUTINE
  // --------------------------------------------------

  const reload = async () => {
    try {
      const result = await loadRoutine(dateKey)
      setItems(Array.isArray(result) ? result : [])
    } catch (error) {
      console.error('Failed to load routine:', error)
      setItems([])
    }
  }

  useEffect(() => {
    reload()
  }, [dateKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // --------------------------------------------------
  // CLOSE PRODUCT MENU WHEN CLICKING OUTSIDE
  // --------------------------------------------------

  useEffect(() => {
    const close = (e) => {
      // Clicks on any "⋯" button or inside the dropdown are handled by
      // their own onClick, so don't let this listener undo them.
      if (
        e.target.closest &&
        e.target.closest('[data-routine-menu]')
      ) {
        return
      }

      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuFor(null)
      }
    }

    document.addEventListener('click', close)

    return () => {
      document.removeEventListener('click', close)
    }
  }, [])

  // The dropdown is positioned on screen, so close it if the page or
  // the routine list scrolls (or the window resizes) underneath it.
  useEffect(() => {
    if (!menuFor) return undefined

    const close = () => setMenuFor(null)

    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)

    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [menuFor])

  // --------------------------------------------------
  // AM / PM INFORMATION
  // --------------------------------------------------

  const isPM = timeOfDay === 'PM'

  const greeting = isPM
    ? 'Good Evening'
    : 'Rise and Shine'

  const firstName =
    user?.name?.split(' ')[0] ?? 'there'

  const routineName =
    `${firstName}'s ${isPM ? 'Night' : 'Morning'} Routine`

  // --------------------------------------------------
  // FILTER CURRENT ROUTINE
  // --------------------------------------------------

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const product = products.find(
        (p) => String(p.id) === String(item.productId)
      )

      if (!product) return false

      // Removed from this period only (e.g. taken out of AM but still in PM).
      // Saved in the database, so it comes back with the routine items.
      if ((timeOfDay === 'PM' ? item.removedPM : item.removedAM) === true) {
        return false
      }

      const productTime =
        String(product.timeOfDay || '').toUpperCase()

      // An empty timeOfDay is addable from the picker, so it must be
      // visible here too — otherwise it silently disappears after adding.
      return (
        productTime === timeOfDay ||
        productTime === 'BOTH' ||
        productTime === ''
      )
    }).map((item) => ({
      // AM and PM are completed separately: use the flag for the
      // period currently shown.
      ...item,
      completed:
        (timeOfDay === 'PM' ? item.completedPM : item.completedAM) === true,
    }))
  }, [items, products, timeOfDay])

  // --------------------------------------------------
  // FILTER SHELF FOR AM / PM
  // --------------------------------------------------

  const availableShelfProducts = useMemo(() => {
    return products.filter((product) => {
      const productTime =
        String(product.timeOfDay || '').toUpperCase()

      return (
        productTime === timeOfDay ||
        productTime === 'BOTH' ||
        productTime === ''
      )
    })
  }, [products, timeOfDay])

  // --------------------------------------------------
  // PROGRESS
  // --------------------------------------------------

  const completed =
    visibleItems.filter((i) => i.completed).length

  const total = visibleItems.length

  // --------------------------------------------------
  // SAFETY CLASHES
  // --------------------------------------------------

  const clashes = findClashes(
    visibleItems,
    products,
    rules
  )

  // --------------------------------------------------
  // MOST USED
  // --------------------------------------------------

  // Counted from the routine_logs rows saved each time a product is ticked off.
  const mostUsed = useMemo(() => {
    const used = products.filter((p) => (p.uses ?? 0) > 0)

    if (!used.length) return '—'

    return used.reduce(
      (a, b) => (b.uses > a.uses ? b : a)
    ).name
  }, [products])

  // --------------------------------------------------
  // ADD NEW PRODUCT
  // --------------------------------------------------

  const addProductFlow = async (p) => {
    try {
      const saved = await saveProduct(p)

      // The form's button is "Add to Routine": besides saving the product to
      // the shelf, put it in the routine for the day being viewed.
      await addToRoutine(dateKey, saved.id)

      setShowForm(false)
      setEditProduct(null)

      await reload()
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  // --------------------------------------------------
  // EDIT PRODUCT
  // --------------------------------------------------

  const handleEditSave = async (p) => {
    try {
      await saveProduct(p)

      setEditProduct(null)

      await reload()
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  }

  // --------------------------------------------------
  // ADD PRODUCT FROM SHELF
  // --------------------------------------------------

  const quickAdd = async (productId) => {
    try {
      const existing = items.find(
        (i) => String(i.productId) === String(productId)
      )

      if (
        existing &&
        (timeOfDay === 'PM' ? existing.removedPM : existing.removedAM) === true
      ) {
        // Removed from this period only: the routine row is still there
        // (it's still in the other period), so just bring it back.
        await setPeriodRemoved(dateKey, productId, timeOfDay, false)
      } else {
        const rowExisted = Boolean(existing)

        await addToRoutine(dateKey, productId)

        // A "Both" product is saved as one routine row that AM and PM both
        // read, so adding it here would also add it to the other period.
        // Mark the other period as not included (saved in the database) so it
        // only lands in the period being viewed.
        const product = products.find(
          (p) => String(p.id) === String(productId)
        )
        const productTime =
          String(product?.timeOfDay || '').toUpperCase()

        if (!rowExisted && (productTime === 'BOTH' || productTime === '')) {
          await setPeriodRemoved(
            dateKey,
            productId,
            timeOfDay === 'AM' ? 'PM' : 'AM',
            true
          )
        }
      }

      setAddPicker(false)

      await reload()
    } catch (error) {
      console.error('Failed to add product to routine:', error)
    }
  }

  // --------------------------------------------------
  // REMOVE FROM ROUTINE (only the AM or PM routine being viewed)
  // --------------------------------------------------

  const handleRemoveFromRoutine = async (p) => {
    setMenuFor(null)

    try {
      const productTime =
        String(p.timeOfDay || '').toUpperCase()

      const otherPeriod = timeOfDay === 'AM' ? 'PM' : 'AM'

      const item = items.find(
        (i) => String(i.productId) === String(p.id)
      )
      const removedFromOther =
        (otherPeriod === 'PM' ? item?.removedPM : item?.removedAM) === true

      // AM-only / PM-only products only ever show in one routine, and a
      // "Both" product already removed from the other period has nowhere
      // left to show, so the routine row itself can go.
      const onlyOnePeriod =
        productTime === 'AM' || productTime === 'PM'

      if (onlyOnePeriod || removedFromOther) {
        // Deleting the row also clears any saved AM / PM removal for it.
        await removeFromRoutine(dateKey, p.id)
      } else {
        // "Both" product: hide it from this period only (saved in the database).
        await setPeriodRemoved(dateKey, p.id, timeOfDay, true)
        notify('Removed from routine.', false)
      }

      await reload()
    } catch (error) {
      console.error('Failed to remove product from routine:', error)
    }
  }

  // --------------------------------------------------
  // DELETE PRODUCT (removes it from the shelf)
  // --------------------------------------------------

  const handleDeleteProduct = async (p) => {
    setMenuFor(null)

    if (
      !confirm(
        `Delete "${p.name}" from your shelf? It will also be removed from your routines.`
      )
    ) {
      return
    }

    try {
      await deleteProduct(p.id)

      await reload()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  // --------------------------------------------------
  // SHIFT WEEK
  // --------------------------------------------------

  const shiftWeek = (dir) => {
    const d = new Date(selected)

    d.setDate(d.getDate() + dir * 7)

    setSelected(d)
  }

  // --------------------------------------------------
  // TODAY
  // --------------------------------------------------

  const goToday = () => {
    setSelected(new Date())
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f5f9f6]">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">

        {/* ==================================================
            GREETING + AM / PM SWITCH
        ================================================== */}

        <div className="
  w-full
  flex
  items-center
  justify-between
  flex-wrap
  gap-4
  mb-6
">

          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
            {greeting},{' '}

            <span className="underline decoration-gg-400 decoration-4 underline-offset-4">
              {firstName}
            </span>
          </h1>

          {/* AM / PM SWITCH */}
          <button
            type="button"
            onClick={() => setTimeOfDay(timeOfDay === 'AM' ? 'PM' : 'AM')}
            aria-label={`Switch to ${timeOfDay === 'AM' ? 'PM' : 'AM'}`}
            className={`
      relative
      w-[76px] h-[32px]
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
        text-[13px]
        font-normal
        transition-all duration-300
        ${timeOfDay === 'AM'
                  ? 'justify-end pr-3 text-white'
                  : 'justify-start pl-3 text-white'
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
        w-[28px] h-[28px]
        rounded-full
        bg-[#f8f7ef]
        border border-[#e5e1d5]
        shadow-[0_1px_4px_rgba(0,0,0,0.12)]
        flex items-center justify-center
        text-[15px]
        text-[#2b2b2b]
        transition-all duration-300 ease-in-out
        ${timeOfDay === 'AM'
                  ? 'left-[2px]'
                  : 'left-[46px]'
                }
      `}
            >
              {timeOfDay === 'AM' ? '☀' : '🌙'}
            </span>
          </button>

        </div>

        {/* ==================================================
            MONTH NAVIGATION
        ================================================== */}

        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-5">

          <button
            type="button"
            onClick={() => shiftWeek(-1)}
            className="
              w-9 h-9
              grid place-items-center
              rounded-full
              bg-gg-100
              text-gg-800
              hover:bg-gg-200
              transition
              text-xl
            "
            aria-label="Previous week"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={goToday}
            className="
              text-xl
              sm:text-2xl
              font-extrabold
              min-w-[180px]
              text-center
              hover:text-gg-700
              transition
            "
          >
            {monthLabel(selected)}
          </button>

          <button
            type="button"
            onClick={() => shiftWeek(1)}
            className="
              w-9 h-9
              grid place-items-center
              rounded-full
              bg-gg-100
              text-gg-800
              hover:bg-gg-200
              transition
              text-xl
            "
            aria-label="Next week"
          >
            ›
          </button>

        </div>

        {/* ==================================================
            WEEK SELECTOR
        ================================================== */}

        <div className="
  w-full
  grid
  grid-cols-7
  gap-2
  sm:gap-3
  mb-6
">
          {week.map((d) => {
            const isSel = fmt(d) === dateKey

            return (
              <button
                key={fmt(d)}
                type="button"
                onClick={() => setSelected(d)}
                className={`
                  w-full
                  min-w-0
                  h-14
                  sm:h-[72px]
                  rounded-xl
                  border
                  text-center
                  transition-all
                  ${isSel
                    ? 'bg-white border-gg-500 shadow-md ring-1 ring-gg-300'
                    : 'bg-white border-gg-200 hover:border-gg-400 hover:shadow-sm'
                  }
                `}
              >
                <div className="text-sm sm:text-base font-bold">
                  {d.getDate()}
                </div>

                <div className="text-[10px] sm:text-xs text-muted">
                  {d.toLocaleDateString(
                    'en-US',
                    { weekday: 'short' }
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* ==================================================
            ADD PRODUCT BUTTON
        ================================================== */}

        <button
          type="button"
          className="btn-primary mb-6"
          onClick={() => {
            setAddPicker(false)
            setShowForm(true)
          }}
        >
          ＋ Add a product
        </button>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div className="
  w-full
  grid
  grid-cols-1
  lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]
  gap-6
  xl:gap-8
  items-start
">
          {/* ==================================================
              ROUTINE LIST
          ================================================== */}

          <div className="
  w-full
  min-w-0
  bg-gg-100/70
  border
  border-gg-200
  rounded-2xl
  p-4
  sm:p-5
  shadow-card
">

            <div className="flex items-center justify-between gap-3 mb-4">

              <div>
                <h3 className="font-extrabold text-lg">
                  {routineName}
                </h3>

                <p className="text-xs text-muted mt-0.5">
                  {timeOfDay === 'AM'
                    ? 'Your morning skincare routine'
                    : 'Your night skincare routine'}
                </p>
              </div>

              <span
                className={`
                  shrink-0
                  px-3
                  py-1.5
                  rounded-full
                  text-xs
                  font-extrabold
                  ${timeOfDay === 'AM'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-indigo-100 text-indigo-700'
                  }
                `}
              >
                {timeOfDay === 'AM'
                  ? '☀ AM'
                  : '🌙 PM'}
              </span>

            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">

              {/* EMPTY STATE */}
              {visibleItems.length === 0 && (
                <div className="
                  text-muted
                  text-sm
                  bg-white/80
                  rounded-xl
                  p-6
                  text-center
                  border
                  border-gg-100
                ">
                  <div className="text-2xl mb-2">
                    {timeOfDay === 'AM' ? '☀️' : '🌙'}
                  </div>

                  <p>
                    No products in your{' '}
                    <b>
                      {timeOfDay === 'AM'
                        ? 'morning'
                        : 'night'}
                    </b>{' '}
                    routine yet.
                  </p>

                  <button
                    type="button"
                    className="text-gg-700 font-bold mt-2 hover:underline"
                    onClick={() => {
                      setAddPicker(true)
                      setShowForm(true)
                    }}
                  >
                    Add a product
                  </button>
                </div>
              )}

              {/* ROUTINE PRODUCTS */}
              {visibleItems.map((item) => {
                const p = products.find(
                  (x) =>
                    String(x.id) ===
                    String(item.productId)
                )

                if (!p) return null

                return (
                  <div
                    key={item.productId}
                    className="relative"
                  >

                    <div className="
                      card
                      !rounded-xl
                      p-3.5
                      sm:p-4
                      flex
                      items-center
                      gap-3
                    ">

                      {/* PRODUCT INFO */}
                      <div className="flex-1 min-w-0">

                        <p className="font-bold truncate">
                          {p.name}
                        </p>

                        <p className="text-xs text-muted truncate">

                          {p.actives?.length
                            ? `Active: ${p.actives.join(', ')}`
                            : p.category}

                          {p.category &&
                            p.actives?.length
                            ? ` · ${p.category}`
                            : ''}

                        </p>

                      </div>

                      {/* COMPLETE BUTTON */}
                      <button
                        type="button"
                        onClick={async () => {
                          await toggleComplete(
                            dateKey,
                            p.id,
                            !item.completed,
                            timeOfDay
                          )

                          await reload()
                        }}
                        aria-label={
                          item.completed
                            ? 'Mark incomplete'
                            : 'Mark complete'
                        }
                        aria-pressed={item.completed}
                        className={`
                          shrink-0
                          w-7
                          h-7
                          rounded-full
                          border-2
                          grid
                          place-items-center
                          text-xs
                          font-bold
                          transition
                          ${item.completed
                            ? 'bg-gg-600 border-gg-600 text-white'
                            : 'border-gg-300 bg-white hover:border-gg-500'
                          }
                        `}
                      >
                        {item.completed ? '✓' : ''}
                      </button>

                      {/* MENU */}
                      <div
                        ref={
                          menuFor === p.id
                            ? menuRef
                            : null
                        }
                        data-routine-menu
                        className="relative shrink-0"
                      >

                        <button
                          type="button"
                          onClick={(e) => {
                            if (menuFor === p.id) {
                              setMenuFor(null)
                              return
                            }

                            // Position the dropdown relative to the screen so
                            // the scrolling routine list can't clip it.
                            const r =
                              e.currentTarget.getBoundingClientRect()
                            const MENU_W = 192 // w-48
                            const MENU_H = 130
                            const left = Math.max(
                              8,
                              Math.min(
                                r.right - MENU_W,
                                window.innerWidth - MENU_W - 8
                              )
                            )
                            const openUp =
                              r.bottom + MENU_H + 8 >
                              window.innerHeight

                            setMenuStyle(
                              openUp
                                ? {
                                    left,
                                    bottom:
                                      window.innerHeight -
                                      r.top +
                                      4,
                                  }
                                : { left, top: r.bottom + 4 }
                            )
                            setMenuFor(p.id)
                          }}
                          aria-label="Product options"
                          className="
                            text-muted
                            hover:text-ink
                            font-extrabold
                            px-1
                            text-lg
                          "
                        >
                          ⋯
                        </button>

                        {menuFor === p.id && createPortal(
                          <div
                            data-routine-menu
                            style={menuStyle}
                            className="
                            fixed
                            z-50
                            w-48
                            card
                            !rounded-xl
                            overflow-hidden
                            text-sm
                            shadow-pop
                            bg-white
                          ">

                            {/* EDIT */}
                            <button
                              type="button"
                              className="
                                w-full
                                text-left
                                px-4
                                py-2.5
                                hover:bg-gg-50
                              "
                              onClick={() => {
                                setEditProduct(p)
                                setMenuFor(null)
                              }}
                            >
                              Edit
                            </button>

                            {/* REMOVE FROM ROUTINE */}
                            <button
                              type="button"
                              className="
                                w-full
                                text-left
                                px-4
                                py-2.5
                                hover:bg-gg-50
                              "
                              onClick={() => handleRemoveFromRoutine(p)}
                            >
                              Remove from routine
                            </button>

                            {/* DELETE PRODUCT */}
                            <button
                              type="button"
                              className="
                                w-full
                                text-left
                                px-4
                                py-2.5
                                text-red-600
                                hover:bg-red-50
                              "
                              onClick={() => handleDeleteProduct(p)}
                            >
                              Delete
                            </button>

                          </div>,
                          document.body
                        )}

                      </div>

                    </div>
                  </div>
                )
              })}

            </div>
          </div>

          {/* ==================================================
              INSIGHTS
          ================================================== */}

          <div className="space-y-5">

            {/* PROGRESS */}
            <div className="card p-5">

              <div className="flex justify-between items-baseline mb-2">

                <h4 className="font-extrabold">
                  Progress
                </h4>

                <span className="text-xs font-bold text-muted">
                  {completed} of {total} Complete
                </span>

              </div>

              <div className="
                h-2.5
                bg-gg-100
                rounded-full
                overflow-hidden
              ">

                <div
                  className="
                    h-full
                    rounded-full
                    bg-gg-800
                    transition-all
                    duration-500
                  "
                  style={{
                    width: total
                      ? `${(completed / total) * 100}%`
                      : '0%',
                  }}
                />

              </div>

            </div>

            {/* ROUTINE INSIGHTS */}
            <div className="card p-5">

              <h4 className="font-extrabold mb-3">
                Routine Insights
              </h4>

              <p className="text-sm text-muted">
                Routine:{' '}
                <span className="text-ink font-semibold">
                  {timeOfDay === 'AM'
                    ? 'Morning'
                    : 'Night'}
                </span>
              </p>

              <p className="text-sm text-muted">
                Skin Type:{' '}
                <span className="text-ink font-semibold">
                  {skinTypeKey(user?.skinType) || '—'}
                </span>
              </p>

              <p className="text-sm text-muted">
                Products in Shelf:{' '}
                <span className="text-ink font-semibold">
                  {products.length}
                </span>
              </p>

              <p className="text-sm text-muted">
                Most-Used Product:{' '}
                <span className="text-ink font-semibold">
                  {mostUsed}
                </span>
              </p>

            </div>

            {/* SAFETY */}
            {clashes.length > 0 && (
              <div className="
                card
                p-5
                border-red-200
                bg-red-50/60
              ">

                <h4 className="
                  font-extrabold
                  mb-2
                  text-red-700
                ">
                  ⚠ Routine Safety
                </h4>

                {clashes.map((r) => (
                  <p
                    key={r.id}
                    className="
                      text-xs
                      text-red-700
                      leading-relaxed
                      mb-1
                    "
                  >
                    {r.severity && <b>{r.severity}: </b>}
                    {r.message}
                  </p>
                ))}

              </div>
            )}

          </div>

        </div>

        {/* ==================================================
            ADD PRODUCT MODAL
        ================================================== */}

        <Modal
          open={showForm}
          onClose={() => {
            setShowForm(false)
            setAddPicker(false)
          }}
          title="Add a Product"
          wide
        >

          {/* MODAL TABS */}
          <div className="flex gap-2 mb-5">

            <button
              type="button"
              className={`
                btn-outline
                flex-1
                ${!addPicker
                  ? 'border-gg-500 bg-gg-50'
                  : ''
                }
              `}
              onClick={() => setAddPicker(false)}
            >
              New product
            </button>

            <button
              type="button"
              className={`
                btn-outline
                flex-1
                ${addPicker
                  ? 'border-gg-500 bg-gg-50'
                  : ''
                }
              `}
              onClick={() => setAddPicker(true)}
            >
              From my shelf
            </button>

          </div>

          {/* FROM SHELF */}
          {addPicker ? (
            <div className="
              space-y-2
              max-h-72
              overflow-y-auto
            ">

              <div className="
                flex
                items-center
                justify-between
                mb-3
                px-1
              ">

                <p className="text-sm text-muted">
                  Showing products for{' '}
                  <b className="text-ink">
                    {timeOfDay === 'AM'
                      ? '☀ AM'
                      : '🌙 PM'}
                  </b>
                </p>

              </div>

              {availableShelfProducts.length === 0 && (
                <div className="
                  text-muted
                  text-sm
                  text-center
                  py-6
                ">
                  <p>
                    No products available for this routine.
                  </p>

                  <button
                    type="button"
                    className="
                      text-gg-700
                      font-bold
                      mt-2
                      hover:underline
                    "
                    onClick={() =>
                      setAddPicker(false)
                    }
                  >
                    Create a new product
                  </button>
                </div>
              )}

              {availableShelfProducts.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => quickAdd(p.id)}
                  className="
                    w-full
                    card
                    !rounded-xl
                    p-3.5
                    text-left
                    hover:border-gg-500
                    hover:shadow-pop
                    transition
                    flex
                    justify-between
                    items-center
                    gap-3
                  "
                >

                  <span className="min-w-0">

                    <span className="
                      font-bold
                      text-sm
                      block
                      truncate
                    ">
                      {p.name}
                    </span>

                    <span className="
                      text-xs
                      text-muted
                      block
                      truncate
                    ">
                      {p.category}

                      {p.actives?.length
                        ? ` · ${p.actives.join(', ')}`
                        : ''}
                    </span>

                  </span>

                  <span className="
                    text-gg-600
                    font-extrabold
                    text-lg
                    shrink-0
                  ">
                    ＋
                  </span>

                </button>
              ))}

            </div>
          ) : (

            /* NEW PRODUCT */
            <ProductForm
              product={null}
              onCancel={() => setShowForm(false)}
              onSaved={addProductFlow}
            />

          )}

        </Modal>

        {/* ==================================================
            EDIT PRODUCT MODAL
        ================================================== */}

        <Modal
          open={!!editProduct}
          onClose={() => setEditProduct(null)}
          title="Edit Product"
          wide
        >

          {editProduct && (
            <ProductForm
              product={editProduct}
              onCancel={() => setEditProduct(null)}
              onSaved={handleEditSave}
            />
          )}

        </Modal>

      </div>
    </div>
  )
}