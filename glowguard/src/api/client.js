import axios from 'axios'
import { getToken, clearToken } from './session'

/**
 * GlowGuard API client — talks to the PHP + MySQL backend in
 * `glowguard-backend/` (see that folder's own comments and schema.sql).
 *
 * SETUP (XAMPP):
 *   1. Copy the `glowguard-backend` folder into your XAMPP `htdocs`
 *      directory, e.g. C:\xampp\htdocs\GlowSem1\glowguard-backend.
 *   2. Start Apache and MySQL from the XAMPP control panel.
 *   3. Import the database (phpMyAdmin "Import" tab, or the mysql CLI).
 *   4. Create a `.env` file in the frontend project root (next to
 *      package.json) — see `.env.example`:
 *        VITE_API_URL=http://localhost/GlowSem1/glowguard-backend
 *      The URL must be the folder that contains `auth/`, `products.php`, etc.
 *   5. Restart the Vite dev server so it picks up the .env value.
 *
 * QUICK CHECK: open  <VITE_API_URL>/auth/me.php  in your browser. If you see
 *   {"error":"Missing Authorization header."}  the backend URL is correct.
 */
const DEFAULT_API_URL = 'http://localhost/GlowSem1/glowguard-backend'

// Trailing slashes are stripped so '/auth/login.php' never becomes '//auth/login.php'.
const baseURL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach the session token (see session.js) to every request.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // No response at all = the backend is unreachable (Apache stopped, wrong
    // URL, CORS failure, timeout). Give every page a readable message through
    // the same `error.response.data.error` path they already use, instead of
    // a misleading "check your credentials".
    if (!err.response) {
      err.response = {
        status: 0,
        data: {
          error:
            'Cannot reach the GlowGuard server. Make sure Apache and MySQL are running in XAMPP and that VITE_API_URL points to your glowguard-backend folder.',
        },
      }
      return Promise.reject(err)
    }

    // If the backend says the session is invalid/expired, drop the local
    // token and bounce to the login page.
    if (err.response.status === 401) {
      clearToken()
      if (!location.pathname.startsWith('/auth') && !location.pathname.startsWith('/reset-password')) location.href = '/auth'
    }
    return Promise.reject(err)
  }
)