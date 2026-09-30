// Per-period "Remove from routine".
//
// A routine row is stored once per (date, product), and a product whose
// time of day is "Both" shows up in the AM *and* the PM routine from that
// one row. Deleting the row would therefore remove it from both. To remove
// a "Both" product from only AM (or only PM) we remember which period was
// removed here, and the Routine / Tracker pages skip it for that period.
//
// Stored per account (same idea as the dark-mode preference) so a shared
// browser doesn't leak one user's removals into another's routine.
const storeKey = (userId) => `gg_routine_removed:${userId}`
const slot = (date, productId, period) => `${date}|${productId}|${period}`

function read(userId) {
    try {
        return JSON.parse(localStorage.getItem(storeKey(userId))) || {}
    } catch {
        return {}
    }
}

function write(userId, data) {
    try {
        localStorage.setItem(storeKey(userId), JSON.stringify(data))
    } catch {
        // Storage full / blocked — the removal just won't persist.
    }
}

export function isRemovedFromPeriod(userId, date, productId, period) {
    return read(userId)[slot(date, productId, period)] === true
}

export function removeFromPeriod(userId, date, productId, period) {
    const data = read(userId)
    data[slot(date, productId, period)] = true
    write(userId, data)
}

export function restoreToPeriod(userId, date, productId, period) {
    const data = read(userId)
    delete data[slot(date, productId, period)]
    write(userId, data)
}

// Forget both periods for a product on a date (used once the routine row
// itself is deleted).
export function clearPeriods(userId, date, productId) {
    const data = read(userId)
    delete data[slot(date, productId, 'AM')]
    delete data[slot(date, productId, 'PM')]
    write(userId, data)
}