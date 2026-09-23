// The only browser storage this app uses is a single auth token, so the
// SPA can stay logged in across page reloads without hitting the server
// on every render. All real data (products, routines, tracker, ingredients,
// clash rules, profile) lives in MySQL and is fetched from the PHP API —
// nothing else is cached client-side.
//
// "Remember me" (see Auth.jsx) decides *where* the token is kept:
//   - checked   -> localStorage   (survives closing the browser)
//   - unchecked -> sessionStorage (cleared when the tab/browser closes)
const TOKEN_KEY = 'gg_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token, remember = true) {
  clearToken()
  if (remember) localStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}
