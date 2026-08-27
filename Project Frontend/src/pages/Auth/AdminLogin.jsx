import { useState } from "react"
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { HiOutlineLockClosed, HiOutlineShieldCheck } from "react-icons/hi2"
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { usePageSEO } from "../../hooks/usePageSEO"

const AdminLoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
})

const isAdminRole = (role) => role?.toLowerCase() === "admin"

const AdminLogin = () => {
  usePageSEO("Admin Login", "Administrator sign in", true)
  const navigate = useNavigate()
  const location = useLocation()
  const { signin, isAuthenticated, isLoading, user } = useAuth()
  const toast = useToast()
  const [authError, setAuthError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // AdminRoute sends the originally requested admin path here as `from`; fall back
  // to the dashboard overview.
  const from = location.state?.from || "/admin/overview"

  // Already signed in as an admin? Skip the form. (Guarded by !isLoading so we
  // don't redirect before the stored session has been re-validated.)
  if (!isLoading && isAuthenticated && isAdminRole(user?.role)) {
    return <Navigate to="/admin/overview" replace />
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    setAuthError("")

    const result = await signin({ email: values.email, password: values.password })

    if (!result.success) {
      setAuthError(result.error)
      setSubmitting(false)
      return
    }

    // The customer and admin login hit the same backend endpoint (one users table
    // with roles), so a valid non-admin can authenticate here — but must not be let
    // into the admin area. The session stays (they're a legitimate customer); we
    // just refuse the admin redirect and say why.
    if (!isAdminRole(result.user?.role)) {
      setAuthError("This account doesn't have admin access.")
      setSubmitting(false)
      return
    }

    toast.success("Welcome back, admin.")
    navigate(from, { replace: true })
    setSubmitting(false)
  }

  const inputClass =
    "w-full bg-slate-800 text-sm text-slate-100 placeholder-slate-500 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition"
  const labelClass = "block text-sm font-medium text-slate-300 mb-2"
  const errorClass = "text-xs text-red-400 mt-1"

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
            <HiOutlineShieldCheck className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wide mb-2">
            Admin Sign In
          </h1>
          <p className="text-sm text-slate-400">
            Restricted area — administrator credentials required
          </p>
        </div>

        {/* Auth error message */}
        {authError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-md">
            <p className="text-sm text-red-400 flex items-center gap-2">
              <HiOutlineLockClosed className="text-base" />
              {authError}
            </p>
          </div>
        )}

        {/* Formik Form */}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={AdminLoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  className={`${inputClass} ${
                    errors.email && touched.email ? "ring-2 ring-red-500/50" : ""
                  }`}
                />
                <ErrorMessage name="email" component="div" className={errorClass} />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <div className="relative">
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`${inputClass} pr-10 ${
                      errors.password && touched.password ? "ring-2 ring-red-500/50" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline className="text-xl" />
                    ) : (
                      <IoEyeOutline className="text-xl" />
                    )}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className={errorClass} />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 rounded-md transition-colors mt-6"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Back to store */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
            ← Back to store
          </Link>
        </div>

        {/* Security note */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <HiOutlineLockClosed className="text-sm" />
          <span>Access is logged and restricted to administrators</span>
        </div>
      </div>
    </main>
  )
}

export default AdminLogin
