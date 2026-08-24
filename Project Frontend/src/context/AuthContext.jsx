import { createContext, useContext, useState, useEffect, useCallback } from "react"

const AuthContext = createContext(null)

const API_BASE_URL = "http://localhost:9000/v1"

// Without a deadline a stalled backend leaves the form spinning forever with no
// error, because fetch only rejects when the connection is actually refused.
const REQUEST_TIMEOUT_MS = 15000

const getRequestErrorMessage = (error, fallback) => {
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return "The server took too long to respond. Please make sure the backend is running and try again."
  }
  if (error instanceof TypeError) {
    return "Could not reach the server. Please check your connection and try again."
  }
  return error.message || fallback
}

const getUserIdentifier = (user) => {
  const identifier = user?.id || user?._id || user?.email
  return identifier ? String(identifier).toLowerCase() : null
}

const getProfileStorageKey = (user) => {
  const identifier = getUserIdentifier(user)
  return identifier ? `customer-profile:${identifier}` : null
}

const getStoredProfile = (user) => {
  try {
    const storageKey = getProfileStorageKey(user)
    const storedProfile = storageKey ? localStorage.getItem(storageKey) : null
    return storedProfile ? JSON.parse(storedProfile) : {}
  } catch {
    return {}
  }
}

const getSessionUser = (user) => {
  if (!user) return user
  const { profilePicture: _profilePicture, ...sessionUser } = user
  return sessionUser
}

const persistCurrentUser = (user) => {
  localStorage.setItem("currentUser", JSON.stringify(getSessionUser(user)))
}

const saveStoredProfile = (user) => {
  const storageKey = getProfileStorageKey(user)
  if (!storageKey) return

  const profileFields = {
    name: user.name,
    phone: user.phone,
    profilePicture: user.profilePicture
  }
  localStorage.setItem(storageKey, JSON.stringify(profileFields))
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Clears every trace of the session. Shared by logout, the load-time
  // re-validation below, and the global "auth:unauthorized" handler.
  const clearSession = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
  }, [])

  // On load, re-validate the stored session against the backend instead of
  // trusting localStorage. This is what makes an admin suspension take effect on
  // refresh: /me returns 403 for a suspended (or deleted) account, so we log out
  // rather than silently restoring the session.
  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem("currentUser")
      const storedToken = localStorage.getItem("authToken")

      // A profile without its JWT cannot access protected routes; drop it.
      if (!storedUser || !storedToken) {
        if (storedUser) localStorage.removeItem("currentUser")
        setIsLoading(false)
        return
      }

      let storedUserData
      try {
        storedUserData = JSON.parse(storedUser)
      } catch {
        clearSession()
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        })

        // 401 = bad/expired token, 403 = suspended. Either way, end the session.
        if (response.status === 401 || response.status === 403) {
          clearSession()
          return
        }

        const data = await response.json().catch(() => ({}))
        const freshUser = data.data || storedUserData
        const mergedUser = { ...storedUserData, ...freshUser, ...getStoredProfile(freshUser) }
        setUser(mergedUser)
        persistCurrentUser(mergedUser)
        setIsAuthenticated(true)
      } catch {
        // Network/timeout means the backend is unreachable, not that the account
        // was rejected. Keep the stored session so being offline doesn't log
        // users out; the next protected request will re-check once it's back.
        const mergedUser = { ...storedUserData, ...getStoredProfile(storedUserData) }
        setUser(mergedUser)
        persistCurrentUser(mergedUser)
        setIsAuthenticated(true)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [clearSession])

  // Any protected API call that returns 401/403 dispatches this event (see
  // CartContext), so a mid-session suspension logs the user out on their next
  // action instead of waiting for a refresh.
  useEffect(() => {
    const onUnauthorized = () => clearSession()
    window.addEventListener("auth:unauthorized", onUnauthorized)
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized)
  }, [clearSession])

  // Signup function - calls real backend API
  const signup = async ({ name, email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      })

      const data = await response.json()

      if (!response.ok || data.success === false || data.status === false) {
        throw new Error(data.message || data.error || "Signup failed")
      }

      // The signup endpoint does not issue a JWT. The user must sign in before
      // accessing protected routes such as the database cart.
      return { success: true, requiresSignin: true }
    } catch (error) {
      return { success: false, error: getRequestErrorMessage(error, "Signup failed") }
    }
  }

  // Signin function - calls real backend API
  const signin = async ({ email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      })

      const data = await response.json()

      if (!response.ok || data.success === false || data.status === false) {
        throw new Error(data.message || data.error || "Login failed")
      }

      // Adjust this based on your actual API response shape.
      const userForState = data.user || data.data || data
      const mergedUser = { ...userForState, ...getStoredProfile(userForState) }

      setUser(mergedUser)
      setIsAuthenticated(true)
      persistCurrentUser(mergedUser)
      if (data.token) localStorage.setItem("authToken", data.token)

      return { success: true, user: mergedUser }
    } catch (error) {
      return { success: false, error: getRequestErrorMessage(error, "Login failed") }
    }
  }

  // Logout function - clears session
  const logout = () => {
    clearSession()
  }

  // Update profile picture
  const updateProfilePicture = (pictureUrl) => {
    try {
      if (!user) return { success: false, error: "No user logged in" }

      const updatedUser = { ...user, profilePicture: pictureUrl }
      setUser(updatedUser)
      saveStoredProfile(updatedUser)
      persistCurrentUser(updatedUser)

      return { success: true, user: updatedUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Update editable customer profile fields kept by the frontend account area.
  const updateProfile = (profileUpdates) => {
    try {
      if (!user) return { success: false, error: "No user logged in" }

      const updatedUser = { ...user, ...profileUpdates }
      setUser(updatedUser)
      saveStoredProfile(updatedUser)
      persistCurrentUser(updatedUser)

      return { success: true, user: updatedUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signup,
    signin,
    logout,
    updateProfilePicture,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
