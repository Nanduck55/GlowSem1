import axios from 'axios'
import { getToken, clearToken } from './session'

/**
 * GlowGuard API client — talks to the PHP + MySQL backend in
 * `glowguard-backend/` (see that folder's own comments and schema.sql).
 *
 * SETUP (XAMPP):
 *   1. Copy the `glowguard-backend` folder into your XAMPP `htdocs`
 *      directory, e.g. C:\xampp\htdocs\glowguard-backend.
 *   2. Start Apache and MySQL from the XAMPP control panel.
 *   3. Import `glowguard-backend/schema.sql` (phpMyAdmin "Import" tab, or
 *      the mysql CLI) to create the `glowguard` database and its tables.
 *   4. Create a `.env` file in the frontend project root:
 *        VITE_API_URL=http://localhost/glowguard-backend
 *   5. Restart the Vite dev server so it picks up the new .env value.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/GlowSem1/glowguard-backend',
  headers: { 'Content-Type': 'application/json' },
})

// Attach the session token (see session.js) to every request.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If the backend says the session is invalid/expired, drop the local token
// and bounce to the login page.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken()
      if (!location.pathname.startsWith('/auth')) location.href = '/auth'
    }
    return Promise.reject(err)
  }
)
