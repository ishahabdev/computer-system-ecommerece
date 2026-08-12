import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2"
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

  const inputClass =
    "w-full bg-gray-50 text-sm text-gray-600 placeholder-gray-400 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#2196F3]/40 transition"
  const labelClass = "block text-sm font-medium text-gray-800 mb-2"
  const errorClass = "text-xs text-red-600 mt-1"

  return (
    <main className="bg-white  flex justify-center min-h-screen">
      {/* Breadcrumb bar */}
      <div className="bg-gray-50">
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link to="/" className="text-[#2196F3] hover:underline transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Sign up</span>
          </nav>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-8 md:py-12">
        <div className="max-w-md">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-[#22262A] mb-2">Sign Up</h1>
            <p className="text-sm text-gray-500">Upgrade your tech game with us!</p>
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
                    Name
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Name"
                    className={`${inputClass} ${
                      errors.name && touched.name ? "ring-2 ring-red-500/40" : ""
                    }`}
                  />
                  <ErrorMessage name="name" component="div" className={errorClass} />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email
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
                      placeholder="Minimum 6 characters"
                      className={`${inputClass} pr-11 ${
                        errors.password && touched.password ? "ring-2 ring-red-500/40" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <HiOutlineEye className="text-lg" />
                      ) : (
                        <HiOutlineEyeSlash className="text-lg" />
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
                      placeholder="Re-enter your password"
                      className={`${inputClass} pr-11 ${
                        errors.confirmPassword && touched.confirmPassword
                          ? "ring-2 ring-red-500/40"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <HiOutlineEye className="text-lg" />
                      ) : (
                        <HiOutlineEyeSlash className="text-lg" />
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
              Already have account?{" "}
              <Link to="/signin" state={{ from }} className="text-[#2196F3] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Signup