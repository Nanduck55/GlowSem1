import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  fetchProducts, saveProduct, deleteProduct, fetchRoutine, addToRoutine,
  updateRoutineItem, removeFromRoutine, setRoutinePeriodRemoved, fetchTracker, restoreSession,
  fetchAdminData, addIngredient, deleteIngredient, addClashRule, updateClashRule, deleteClashRule,
  fetchRecommendations, addRecommendation, updateRecommendation, deleteRecommendation,
} from '../api/services'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  // True until we've checked whether the stored token still maps to a
  // valid session on the server. Protected routes wait on this so a
  // logged-in user isn't bounced to /auth for a split second on refresh.
  const [checkingSession, setCheckingSession] = useState(true)
  const [products, setProducts] = useState([])
  const [rules, setRules] = useState([])
  const [ingredients, setIngredients] = useState([])
  // GlowCouncil recommendations. The API only returns the visible ones to
  // regular users; Beauty Consultants get everything (including hidden).
  const [recommendations, setRecommendations] = useState([])
  const [recsLoaded, setRecsLoaded] = useState(false)
  const [toast, setToast] = useState(null)
  // True once the first products/rules fetch has finished (success or fail).
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    restoreSession()
      .then(setUser)
      .finally(() => setCheckingSession(false))
  }, [])

  // Dark mode is a per-account preference, not a per-browser one — it's
  // keyed by user id so that on a shared device, User A turning dark mode
  // on doesn't carry over to User B's session.
  const darkModeKey = (u) => `gg_dark_mode:${u.id}`

  // Light mode is the default for a new account.
  // A saved per-user preference still takes priority on later visits.
  const [darkMode, setDarkMode] = useState(false)

  // Whenever the signed-in user changes (login, or switching accounts on the
  // same browser), load THAT account's own saved preference instead of
  // whatever was last showing.
  useEffect(() => {
    if (!user) return
    const saved = localStorage.getItem(darkModeKey(user))
    setDarkMode(saved !== null ? saved === 'true' : false)
  }, [user?.id])

  // Only saves the preference for the current account. Whether dark mode is
  // actually shown depends on the page (Landing and Auth are always light)
  // — see AppLayout in App.jsx.
  useEffect(() => {
    if (!user) return
    localStorage.setItem(darkModeKey(user), String(darkMode))
  }, [darkMode, user])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((current) => !current)
  }, [])

  const notify = useCallback((msg, success = true) => {
    setToast({ msg, success })
    setTimeout(() => setToast(null), 3200)
  }, [])

 const loadAll = useCallback(async () => {
  try {
    const [prods, admin] = await Promise.all([
      fetchProducts(),
      fetchAdminData(),
    ])

    setProducts(Array.isArray(prods) ? prods : [])
    setRules(Array.isArray(admin?.rules) ? admin.rules : [])
    setIngredients(
      Array.isArray(admin?.ingredients)
        ? admin.ingredients
        : []
    )
  } catch (error) {
    console.error('Failed to load GlowGuard data:', error)

    // Keep the application usable even if data loading fails.
    setProducts([])
    setRules([])
    setIngredients([])

    notify(
      'Some GlowGuard data could not be loaded.',
      false
    )
  } finally {
    setDataLoaded(true)
  }
}, [notify])

  useEffect(() => { if (user) loadAll() }, [user, loadAll])

  // Recommendations load on their own (not inside loadAll) so a problem with
  // them can never blank out the shelf, rules or ingredients above.
  const loadRecommendations = useCallback(async () => {
    try {
      const recs = await fetchRecommendations()
      setRecommendations(Array.isArray(recs) ? recs : [])
    } catch (error) {
      console.error('Failed to load GlowCouncil recommendations:', error)
      setRecommendations([])
    } finally {
      setRecsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (user) loadRecommendations()
    else {
      setRecommendations([])
      setRecsLoaded(false)
    }
  }, [user, loadRecommendations])

  /* ---------------- product actions ---------------- */
  const saveProductAction = async (product) => {
    const saved = await saveProduct(product)
    await loadAll()
    notify(product.id ? 'Product updated.' : `"${saved.name}" added to your shelf.`)
    return saved
  }
  const deleteProductAction = async (id) => {
    await deleteProduct(id)
    await loadAll()
    notify('Product deleted.', false)
  }

  /* ---------------- routine actions (per date) ---------------- */
  const loadRoutine = async (date) => fetchRoutine(date)
  const addToRoutineAction = async (date, productId) => {
    await addToRoutine(date, productId)
    notify('Added to routine.')
  }
  const toggleComplete = async (date, productId, completed, timeOfDay) => {
    await updateRoutineItem(date, productId, { completed, timeOfDay })
    // Keep each product's usage count (Routine Insights) current.
    fetchProducts().then((list) => Array.isArray(list) && setProducts(list)).catch(() => {})
  }
  // Take a product out of just AM or just PM for a day (or put it back).
  const setPeriodRemoved = async (date, productId, period, removed) => {
    await setRoutinePeriodRemoved(date, productId, period, removed)
  }
  const removeFromRoutineAction = async (date, productId) => {
    await removeFromRoutine(date, productId)
    notify('Removed from routine.', false)
  }

  /* ---------------- tracker ---------------- */
  const loadTracker = async () => fetchTracker()

  /* ---------------- admin actions ---------------- */
  const addIngredientAction = async (name) => { await addIngredient(name); await loadAll() }
  const deleteIngredientAction = async (name) => { await deleteIngredient(name); await loadAll() }
  const addClashRuleAction = async (rule) => { await addClashRule(rule); await loadAll() }
  const updateClashRuleAction = async (rule) => { await updateClashRule(rule); await loadAll() }
  const deleteClashRuleAction = async (id) => { await deleteClashRule(id); await loadAll() }

  /* ---------------- curation actions (Beauty Consultant) ---------------- */
  const addRecommendationAction = async (rec) => { await addRecommendation(rec); await loadRecommendations() }
  const updateRecommendationAction = async (rec) => { await updateRecommendation(rec); await loadRecommendations() }
  const deleteRecommendationAction = async (id) => { await deleteRecommendation(id); await loadRecommendations() }

  return (
    <AppCtx.Provider value={{
      user, setUser, checkingSession,
      products, rules, ingredients, dataLoaded,
      darkMode, toggleDarkMode,
      saveProduct: saveProductAction, deleteProduct: deleteProductAction,
      loadRoutine, addToRoutine: addToRoutineAction,
      toggleComplete, removeFromRoutine: removeFromRoutineAction, setPeriodRemoved,
      loadTracker,
      addIngredient: addIngredientAction, deleteIngredient: deleteIngredientAction,
      addClashRule: addClashRuleAction, updateClashRule: updateClashRuleAction, deleteClashRule: deleteClashRuleAction,
      recommendations, recsLoaded,
      addRecommendation: addRecommendationAction, updateRecommendation: updateRecommendationAction, deleteRecommendation: deleteRecommendationAction,
      notify,
    }}>
      {children}
      {toast && (
        <div className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[11000] px-6 py-3.5 rounded-xl text-sm font-semibold text-white shadow-2xl max-w-[calc(100vw-40px)] text-center
          ${toast.success ? 'bg-gg-800' : 'bg-ink'}`}>
          {toast.msg}
        </div>
      )}
    </AppCtx.Provider>
  )
}