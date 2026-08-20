import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

const API_BASE_URL = "http://localhost:9000/v1"

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
  const { profilePicture, ...sessionUser } = user
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

  // Load user from localStorage on mount (keeps user logged in after refresh)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser")
      const storedToken = localStorage.getItem("authToken")
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser)
        const mergedUser = { ...userData, ...getStoredProfile(userData) }
        setUser(mergedUser)
        persistCurrentUser(mergedUser)
        setIsAuthenticated(true)
      } else if (storedUser) {
        // A user profile without the JWT cannot access protected API routes.
        localStorage.removeItem("currentUser")
      }
    } catch (error) {
      // Failed to load user from localStorage - silent fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Signup function - calls real backend API
  const signup = async ({ name, email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (!response.ok || data.success === false || data.status === false) {
        throw new Error(data.message || data.error || "Signup failed")
      }

      // The signup endpoint does not issue a JWT. The user must sign in before
      // accessing protected routes such as the database cart.
      return { success: true, requiresSignin: true }
    } catch (error) {
      return { success: false, error: error.message }
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
        body: JSON.stringify({ email, password })
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
      return { success: false, error: error.message }
    }
  }

  // Logout function - clears session
  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
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
