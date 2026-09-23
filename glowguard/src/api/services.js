import { api } from './client'
import { getToken, setToken, clearToken } from './session'
import { CATEGORIES } from './constants'

/* ------------------------------------------------------------------ */
/*  AUTH                                                               */
/* ------------------------------------------------------------------ */
export async function loginUser({ email, password }, remember = true) {
  const { data } = await api.post('/auth/login.php', { email, password })
  setToken(data.token, remember)
  return data.user
}

export async function registerUser({ name, email, password }, remember = true) {
  const { data } = await api.post('/auth/register.php', { name, email, password })
  setToken(data.token, remember)
  return data.user
}

export async function logoutUser() {
  try {
    await api.post('/auth/logout.php')
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
  } catch {
    clearToken()
    return null
  }
}

export async function updateProfile(patch) {
  const { data } = await api.put('/auth/profile.php', patch)
  return data.user
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
/*  ROUTINES  (keyed by routine_type: 'AM' or 'PM')                    */
/* ------------------------------------------------------------------ */
export async function fetchRoutine(routineType) {
  return (await api.get('/routines.php', { params: { routine_type: routineType } })).data
}

export async function addToRoutine(routineType, productId) {
  return (await api.post('/routines.php', { routine_type: routineType, product_id: productId })).data
}

export async function updateRoutineItem(routineType, productId, patch) {
  return (await api.put('/routines.php', { routine_type: routineType, product_id: productId, ...patch })).data
}

export async function removeFromRoutine(routineType, productId) {
  await api.delete('/routines.php', { params: { routine_type: routineType, product_id: productId } })
}
/* ------------------------------------------------------------------ */
/*  TRACKER                                                            */
/* ------------------------------------------------------------------ */
export async function fetchTracker() {
  return (await api.get('/tracker.php')).data
}

/* ------------------------------------------------------------------ */
/*  ADMIN — ingredients dictionary & clash rules                       */
/* ------------------------------------------------------------------ */
export async function fetchAdminData() {
  const [ingredients, rules] = await Promise.all([
    api.get('/admin/ingredients.php'),
    api.get('/admin/clash-rules.php'),
  ])
  return { ingredients: ingredients.data, rules: rules.data }
}

export async function addIngredient(name) {
  return (await api.post('/admin/ingredients.php', { name })).data
}

export async function deleteIngredient(name) {
  await api.delete('/admin/ingredients.php', { params: { name } })
}

export async function addClashRule(rule) {
  return (await api.post('/admin/clash-rules.php', rule)).data
}

export async function updateClashRule(rule) {
  return (await api.put('/admin/clash-rules.php', rule)).data
}

export async function deleteClashRule(id) {
  await api.delete('/admin/clash-rules.php', { params: { id } })
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
