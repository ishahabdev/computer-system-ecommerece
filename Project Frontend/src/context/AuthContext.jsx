import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

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

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Failed to load user from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Signup function - creates new user account
  const signup = ({ name, email, password }) => {
    try {
      // Get existing users from localStorage
      const usersJSON = localStorage.getItem("users")
      const users = usersJSON ? JSON.parse(usersJSON) : []

      // Check if email already exists
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (existingUser) {
        throw new Error("An account with this email already exists")
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In production, this should be hashed on the backend
        createdAt: new Date().toISOString()
      }

      // Add to users array and save
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Auto-login the new user
      const userForState = { id: newUser.id, name: newUser.name, email: newUser.email }
      setUser(userForState)
      setIsAuthenticated(true)
      localStorage.setItem("currentUser", JSON.stringify(userForState))

      return { success: true, user: userForState }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Signin function - validates credentials and logs in
  const signin = ({ email, password }) => {
    try {
      // Get users from localStorage
      const usersJSON = localStorage.getItem("users")
      const users = usersJSON ? JSON.parse(usersJSON) : []

      // Find user by email
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())

      if (!foundUser) {
        throw new Error("No account found with this email address")
      }

      // Validate password
      if (foundUser.password !== password) {
        throw new Error("Incorrect password")
      }

      // Login successful
      const userForState = { id: foundUser.id, name: foundUser.name, email: foundUser.email }
      setUser(userForState)
      setIsAuthenticated(true)
      localStorage.setItem("currentUser", JSON.stringify(userForState))

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
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signup,
    signin,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
