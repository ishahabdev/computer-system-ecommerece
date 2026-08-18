import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

const API_BASE_URL = "http://localhost:9000/v1"

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
        setUser(userData)
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

      setUser(userForState)
      setIsAuthenticated(true)
      localStorage.setItem("currentUser", JSON.stringify(userForState))
      if (data.token) localStorage.setItem("authToken", data.token)

      return { success: true, user: userForState }
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
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))

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
    updateProfilePicture
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
