import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { HiOutlineLockClosed } from "react-icons/hi2"

const API_BASE_URL = "http://localhost:9000/v1"

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required")
})

const VerificationCodeSchema = Yup.object().shape({
  code: Yup.string()
    .length(6, "Code must be 6 digits")
    .required("Verification code is required")
})

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password")
})

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const startResendTimer = () => {
    setResendTimer(60)
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Step 1: Request OTP - backend generates it and emails it to the user
  const handleEmailSubmit = async (values, { setSubmitting }) => {
    setErrorMessage("")

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to verify email")
      }

      sessionStorage.setItem("resetEmail", values.email.trim())
      setEmail(values.email.trim())
      setStep(2)
      startResendTimer()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2: Verify code - checked against backend, not sessionStorage
  const handleCodeSubmit = async (values, { setSubmitting }) => {
    setErrorMessage("")

    try {
      const storedEmail = sessionStorage.getItem("resetEmail")
      if (!storedEmail) throw new Error("Session expired, please start again")

      const response = await fetch(`${API_BASE_URL}/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: storedEmail, code: values.code }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Invalid verification code")
      }

      setVerificationCode(values.code)
      setStep(3)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Step 3: Reset password
  const handlePasswordSubmit = async (values, { setSubmitting }) => {
    setErrorMessage("")

    try {
      const storedEmail = sessionStorage.getItem("resetEmail")
      if (!storedEmail) throw new Error("Password reset session expired")

      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: storedEmail, password: values.password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to update password")
      }

      sessionStorage.removeItem("resetEmail")
      alert("Password updated successfully! Please sign in with your new password.")
      navigate("/signin")
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Resend code - asks backend to generate + email a new OTP
  const handleResendCode = async () => {
    if (resendTimer > 0) return
    setErrorMessage("")

    try {
      const storedEmail = sessionStorage.getItem("resetEmail")
      if (!storedEmail) throw new Error("Session expired, please start again")

      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: storedEmail }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to resend code")
      }

      startResendTimer()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  // Change email
  const handleChangeEmail = () => {
    setStep(1)
    setEmail("")
    sessionStorage.removeItem("resetEmail")
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
            <span className="text-gray-600">account recovery</span>
          </nav>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-8 md:py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#22262A] uppercase tracking-wide mb-2">
              Recover Account
            </h1>
            <p className="text-sm text-gray-600">
              {step === 1 && "Enter your registered email to receive verification code"}
              {step === 2 && "A 6-digit code has been sent to your email address"}
              {step === 3 && "Please create new password"}
            </p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <HiOutlineLockClosed className="text-base" />
                {errorMessage}
              </p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <Formik
              initialValues={{ email: "" }}
              validationSchema={ForgotPasswordSchema}
              onSubmit={handleEmailSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-5">
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2196F3] hover:bg-[#1a7fd1] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 rounded-md transition-colors"
                  >
                    {isSubmitting ? "Sending..." : "Continue"}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* Step 2: Verification Code */}
          {step === 2 && (
            <>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-gray-700">
                  ****{email.split('@')[1]} 
                  <button 
                    onClick={handleChangeEmail}
                    className="ml-2 text-[#2196F3] hover:underline font-medium"
                  >
                    Change email
                  </button>
                </p>
              </div>

              <Formik
                initialValues={{ code: "" }}
                validationSchema={VerificationCodeSchema}
                onSubmit={handleCodeSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-5">
                    <div>
                      <label htmlFor="code" className={labelClass}>
                        Verification code
                      </label>
                      <Field
                        id="code"
                        name="code"
                        type="text"
                        placeholder="Enter your verification code"
                        maxLength="6"
                        className={`${inputClass} ${
                          errors.code && touched.code ? "ring-2 ring-red-500/40" : ""
                        }`}
                      />
                      <ErrorMessage name="code" component="div" className={errorClass} />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#2196F3] hover:bg-[#1a7fd1] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 rounded-md transition-colors"
                    >
                      {isSubmitting ? "Verifying..." : "Continue"}
                    </button>
                  </Form>
                )}
              </Formik>

              <div className="mt-6 text-center">
                <button
                  onClick={handleResendCode}
                  disabled={resendTimer > 0}
                  className="text-sm text-[#2196F3] hover:underline font-medium disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                </button>
              </div>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={ResetPasswordSchema}
              onSubmit={handlePasswordSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-5">
                  <div>
                    <label htmlFor="password" className={labelClass}>
                      New Password
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className={errorClass} />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className={labelClass}>
                      Confirm new password
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className={errorClass} />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2196F3] hover:bg-[#1a7fd1] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 rounded-md transition-colors"
                  >
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* Back to signin */}
          <div className="mt-6 text-center">
            <Link 
              to="/signin" 
              className="text-sm text-gray-600 hover:text-[#2196F3] transition-colors"
            >
              ← Back to Sign In
            </Link>
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

export default ForgotPassword