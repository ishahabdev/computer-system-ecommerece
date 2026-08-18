import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { HiOutlineLockClosed } from "react-icons/hi2"
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5"
import { useAuth } from "../../context/AuthContext"
import { usePageSEO } from '../../hooks/usePageSEO'
import { PAGE_SEO } from '../../utils/seo'
import { useToast } from '../../context/ToastContext'

const SigninSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required")
})

const Signin = () => {
  usePageSEO(PAGE_SEO.signin.title, PAGE_SEO.signin.description, PAGE_SEO.signin.noIndex);
  const navigate = useNavigate()
  const location = useLocation()
  const { signin } = useAuth()
  const toast = useToast()
  const [authError, setAuthError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from || "/"

  const handleSubmit = async (values, { setSubmitting }) => {
    setAuthError("")
    
    const result = await signin({ 
      email: values.email, 
      password: values.password 
    })

    if (result.success) {
      toast.success('Welcome back! Successfully signed in.');
      // Redirect to the page they tried to visit or home
      navigate(from, { replace: true })
    } else {
      setAuthError(result.error)
    }
    
    setSubmitting(false)
  }

  const inputClass = "w-full bg-gray-50 text-sm text-gray-600 placeholder-gray-400 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#2196F3]/40 transition"
  const labelClass = "block text-sm font-medium text-gray-700 mb-2"
  const errorClass = "text-xs text-red-600 mt-1"

  return (
    <main className="bg-white min-h-screen">
      {/* Breadcrumb bar */}
      <div className="bg-gray-50">
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link to="/" className="text-[#2196F3] hover:underline transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">signin</span>
          </nav>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-8 md:py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#22262A] uppercase tracking-wide mb-2">
              Sign In
            </h1>
            <p className="text-sm text-gray-600">
              Welcome back! Please sign in to continue
            </p>
          </div>

          {/* Auth error message */}
          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <HiOutlineLockClosed className="text-base" />
                {authError}
              </p>
            </div>
          )}

          {/* Formik Form */}
          <Formik
            initialValues={{
              email: "",
              password: ""
            }}
            validationSchema={SigninSchema}
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
                    placeholder="you@example.com"
                    className={`${inputClass} ${
                      errors.email && touched.email ? "ring-2 ring-red-500/40" : ""
                    }`}
                  />
                  <ErrorMessage name="email" component="div" className={errorClass} />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className={labelClass.replace("mb-2", "")}>
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-[#2196F3] hover:underline font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`${inputClass} pr-10 ${
                        errors.password && touched.password ? "ring-2 ring-red-500/40" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="w-full bg-[#2196F3] hover:bg-[#1a7fd1] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 rounded-md transition-colors mt-6"
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
              </Form>
            )}
          </Formik>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                state={{ from }}
                className="text-[#2196F3] hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Security note */}
          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <HiOutlineLockClosed className="text-sm" />
            <span>Your information is secure</span>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Signin
