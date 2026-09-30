import { api } from './client'
import { getToken, setToken, clearToken } from './session'
import { CATEGORIES, SKIN_TYPES } from './constants'

/* ------------------------------------------------------------------ */
/*  AUTH                                                               */
/* ------------------------------------------------------------------ */
export async function loginUser({ email, password }, remember = true) {
  const { data } = await api.post('/auth/login.php', { email, password })
  setToken(data.token, remember)
  return data.user
}

export async function registerUser({ name, email, password }) {
  const { data } = await api.post('/auth/register.php', {
    name,
    email,
    password,
  })

  // Registration does NOT create a browser session.
  return data.user
}

export async function logoutUser() {
  try {
    await api.post('/auth/logout.php')
  } catch {
    // Server unreachable or token already invalid — either way the person
    // is logging out, so don't let the error block clearing the local session.
  } finally {
    clearToken()
  }
}

/**
 * Restores the session on page load by validating the stored token
 * against the backend. Returns the user, or null if there is no valid
 * session (no token, or the token has expired/was revoked).
 */
export async function restoreSession() {
  if (!getToken()) return null
  try {
    const { data } = await api.get('/auth/me.php')
    return data.user
  } catch (err) {
    // Only throw the token away when the server actually rejected it (401).
    // If the backend is just unreachable (Apache/MySQL not started yet), keep
    // the token so a refresh works once the server is back.
    if (err.response?.status === 401) clearToken()
    return null
  }
}

export async function updateProfile(patch) {
  const { data } = await api.put('/auth/profile.php', patch)
  return data.user
}

/**
 * Password reset (uses the `password_resets` table).
 *  - requestPasswordReset: always resolves the same way whether or not the
 *    email exists, so the endpoint can't be used to discover accounts.
 *  - verifyResetToken: resolves { email } (masked) if the token is valid and
 *    unexpired, otherwise rejects.
 *  - resetPassword: sets the new password and invalidates the token.
 */
export async function requestPasswordReset(email) {
  const { data } = await api.post('/auth/forgot-password.php', { email })
  return data
}

export async function verifyResetToken(token) {
  const { data } = await api.post('/auth/verify-reset-token.php', { token })
  return data
}

export async function resetPassword({ token, password }) {
  const { data } = await api.post('/auth/reset-password.php', { token, password })
  return data
}

/* ------------------------------------------------------------------ */
/*  PRODUCTS                                                           */
/* ------------------------------------------------------------------ */
export async function fetchProducts() {
  return (await api.get('/products.php')).data
}

export async function saveProduct(product) {
  const { data } = product.id
    ? await api.put('/products.php', product)
    : await api.post('/products.php', product)
  return data
}

export async function deleteProduct(id) {
  await api.delete('/products.php', { params: { id } })
}

/* ------------------------------------------------------------------ */
/*  ROUTINES  (keyed by date: 'YYYY-MM-DD')                            */
/* ------------------------------------------------------------------ */
export async function fetchRoutine(date) {
  return (await api.get('/routines.php', { params: { date } })).data
}

export async function addToRoutine(date, productId) {
  return (await api.post('/routines.php', { date, productId })).data
}

export async function updateRoutineItem(date, productId, patch) {
  return (await api.put('/routines.php', { date, productId, ...patch })).data
}

export async function removeFromRoutine(date, productId) {
  await api.delete('/routines.php', { params: { date, productId } })
}

// Hides a product from ONE period (AM or PM) of a day's routine, or brings it
// back. Saved in the database, so it follows the account across devices.
export async function setRoutinePeriodRemoved(date, productId, period, removed) {
  return (await api.put('/routines.php', { date, productId, period, removed })).data
}

/* ------------------------------------------------------------------ */
/*  TRACKER                                                            */
/* ------------------------------------------------------------------ */
export async function fetchTracker() {
  return (await api.get('/tracker.php')).data
}

/* ------------------------------------------------------------------ */
/*  Ingredients dictionary (admin-managed) & Safety Clash Rules         */
/*  (Beauty-Consultant-managed). Both are read by EVERY signed-in role  */
/*  because the safety engine on the user's own Routine page needs     */
/*  them — only the write endpoints are role-gated on the backend.     */
/* ------------------------------------------------------------------ */
export async function fetchAdminData() {
  const [ingredients, rules] = await Promise.all([
    api.get('/admin/ingredients.php'),
    api.get('/clash-rules.php'),
  ])
  return { ingredients: ingredients.data, rules: rules.data }
}

export async function addIngredient(name) {
  return (await api.post('/admin/ingredients.php', { name })).data
}

export async function deleteIngredient(name) {
  await api.delete('/admin/ingredients.php', { params: { name } })
}

// Safety Clash Rules — reads are open to any signed-in user, but the
// backend only allows Beauty Consultant accounts (role: 'consultant') to
// create, edit, or delete a rule.
export async function addClashRule(rule) {
  return (await api.post('/clash-rules.php', rule)).data
}

export async function updateClashRule(rule) {
  return (await api.put('/clash-rules.php', rule)).data
}

export async function deleteClashRule(id) {
  await api.delete('/clash-rules.php', { params: { id } })
}

/* ------------------------------------------------------------------ */
/*  GLOWCOUNCIL CURATION — product recommendations by skin type        */
/*  Backed by glowguard-backend/recommendations.php. Any signed-in     */
/*  user can read (regular users only get the visible ones); only      */
/*  Beauty Consultants can add, edit, or delete.                       */
/*  Each item: id, name, category, skinType, starIngredient,           */
/*  description, visible.                                              */
/* ------------------------------------------------------------------ */
export async function fetchRecommendations() {
  return (await api.get('/recommendations.php')).data
}

export async function addRecommendation(rec) {
  return (await api.post('/recommendations.php', rec)).data
}

export async function updateRecommendation(rec) {
  return (await api.put('/recommendations.php', rec)).data
}

export async function deleteRecommendation(id) {
  await api.delete('/recommendations.php', { params: { id } })
}

/**
 * Maps whatever is stored on the account ("Combination Skin", "combination",
 * "Normal Skin") onto one of SKIN_TYPES so it can be matched against a
 * recommendation's skin type. Returns '' when there is no usable value.
 */
export function skinTypeKey(value) {
  const base = String(value ?? '').replace(/\s*skin\s*$/i, '').trim().toLowerCase()
  if (base === 'normal') return 'Balanced'
  return SKIN_TYPES.find((t) => t.toLowerCase() === base) ?? ''
}

/* ------------------------------------------------------------------ */
/*  ADMIN — user management                                            */
/*  Backed by glowguard-backend/admin/users.php (admins only).         */
/*  Each user: id, name, email, role, status, createdAt, skinType,     */
/*  skinGoal (shown as "Routine Goal" in the admin UI).                */
/*  GET  ?            -> list      GET ?id=  -> one user              */
/*  PUT  {id, status} -> update status, returns the updated user      */
/* ------------------------------------------------------------------ */
function normalizeUser(u) {
  const status = String(u.status ?? (u.isActive === false || u.is_active === 0 || u.is_active === '0' ? 'deactivated' : 'active')).toLowerCase()
  return {
    ...u,
    role: String(u.role ?? 'user').toLowerCase(),
    createdAt: u.createdAt ?? u.created_at,
    skinType: u.skinType ?? u.skin_type,
    routineGoal: u.routineGoal ?? u.skinGoal ?? u.skin_goal,
    active: status === 'active',
  }
}

export async function fetchUsers() {
  const { data } = await api.get('/admin/users.php')
  return (Array.isArray(data) ? data : data.users ?? []).map(normalizeUser)
}

export async function fetchUser(id) {
  const { data } = await api.get('/admin/users.php', { params: { id } })
  return normalizeUser(data.user ?? data)
}

export async function setUserActive(id, active) {
  const { data } = await api.put('/admin/users.php', { id, status: active ? 'active' : 'deactivated' })
  return normalizeUser(data.user ?? data)
}

/* ------------------------------------------------------------------ */
/*  SAFETY ENGINE — evaluates a routine against the clash rules        */
/*  (pure function, no storage — unchanged from before)                */
/* ------------------------------------------------------------------ */
export function findClashes(routineItems, products, rules) {
  const inRoutine = routineItems
    .map((r) => products.find((p) => p.id === r.productId))
    .filter(Boolean)
  const alerts = []
  for (const rule of rules) {
    const hasA = inRoutine.some((p) => p.actives.includes(rule.a))
    const hasB = inRoutine.some((p) => p.actives.includes(rule.b))
    if (hasA && hasB) alerts.push(rule)
  }
  return alerts
}

export { CATEGORIES }