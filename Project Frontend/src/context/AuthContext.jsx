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
      // Failed to load user from localStorage - silent fail
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

  // Update profile picture
  const updateProfilePicture = (pictureUrl) => {
    try {
      if (!user) return { success: false, error: "No user logged in" }

      // Update current user state
      const updatedUser = { ...user, profilePicture: pictureUrl }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))

      // Update in users array
      const usersJSON = localStorage.getItem("users")
      const users = usersJSON ? JSON.parse(usersJSON) : []
      const userIndex = users.findIndex(u => u.id === user.id)
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], profilePicture: pictureUrl }
        localStorage.setItem("users", JSON.stringify(users))
      }

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
