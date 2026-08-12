import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { HiOutlineLockClosed } from "react-icons/hi2"
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5"
import { useAuth } from "../../context/AuthContext"

const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password")
})

const Signup = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signup } = useAuth()
  const [authError, setAuthError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const from = location.state?.from || "/"

  const handleSubmit = async (values, { setSubmitting }) => {
    setAuthError("")
    
    const result = signup({ 
      name: values.name,
      email: values.email, 
      password: values.password 
    })

    if (result.success) {
      // Auto-login successful, redirect to intended page or home
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
            <span className="text-gray-600">signup</span>
          </nav>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-8 md:py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#22262A] uppercase tracking-wide mb-2">
              Create Account
            </h1>
            <p className="text-sm text-gray-600">
              Upgrade your tech game with us
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
              name: "",
              email: "",
              password: "",
              confirmPassword: ""
            }}
            validationSchema={SignupSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full Name
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    className={`${inputClass} ${
                      errors.name && touched.name ? "ring-2 ring-red-500/40" : ""
                    }`}
                  />
                  <ErrorMessage name="name" component="div" className={errorClass} />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="myemail@email.com"
                    className={`${inputClass} ${
                      errors.email && touched.email ? "ring-2 ring-red-500/40" : ""
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
                      placeholder="••••••••"
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

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`${inputClass} pr-10 ${
                        errors.confirmPassword && touched.confirmPassword ? "ring-2 ring-red-500/40" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? (
                        <IoEyeOffOutline className="text-xl" />
                      ) : (
                        <IoEyeOutline className="text-xl" />
                      )}
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className={errorClass} />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2196F3] hover:bg-[#1a7fd1] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 rounded-md transition-colors mt-6"
                >
                  {isSubmitting ? "Creating account..." : "Sign Up"}
                </button>
              </Form>
            )}
          </Formik>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link 
                to="/signin" 
                state={{ from }}
                className="text-[#2196F3] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Security note */}
          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <HiOutlineLockClosed className="text-sm" />
            <span>Your information is secure and encrypted</span>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Signup
