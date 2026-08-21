import { useEffect, useState } from "react";
import { HiOutlineLockClosed } from "react-icons/hi2";
import { FiCheckCircle } from "react-icons/fi";
import {
  BUTTON_PRIMARY,
  CARD,
  FIELD_INPUT,
  FIELD_LABEL,
  TAB_SUBTITLE,
  TAB_TITLE,
} from "../dashboardStyles";

const API_BASE_URL = "http://localhost:9000/v1";

// 1: request code, 2: enter the emailed code, 3: choose a new password.
const STEPS = [
  { id: 1, label: "Send code" },
  { id: 2, label: "Verify code" },
  { id: 3, label: "New password" },
];

const ChangePasswordTab = ({ user }) => {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const email = user?.email || "";

  // Countdown for the resend button; each tick reschedules itself and cleans up.
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timeout = setTimeout(() => setResendTimer((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendTimer]);

  const post = async (path, body, fallbackError) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false || data.status === false) {
      throw new Error(data.message || fallbackError);
    }
    return data;
  };

  // Step 1 (and resend): ask the backend to email a fresh code to the account
  // address, then reveal the code field straight away.
  const handleSendCode = async (isResend = false) => {
    setMessage("");
    setError("");

    if (!email) {
      setError("No email address is available for this account.");
      return;
    }
    if (isResend && resendTimer > 0) return;

    setIsBusy(true);
    try {
      await post("/forgot-password", { email }, "Unable to send verification code");

      sessionStorage.setItem("resetEmail", email);
      setCode("");
      setStep(2);
      setResendTimer(60);
      setMessage(`A 6-digit verification code was sent to ${email}.`);
    } catch (requestError) {
      setError(requestError.message || "Unable to send verification code");
    } finally {
      setIsBusy(false);
    }
  };

  // Step 2: the code is checked by the backend, never trusted from the browser.
  const handleVerifyCode = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (code.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setIsBusy(true);
    try {
      await post("/verify-code", { email, code }, "Invalid verification code");

      setStep(3);
      setMessage("Code verified. Choose your new password.");
    } catch (requestError) {
      setError(requestError.message || "Invalid verification code");
    } finally {
      setIsBusy(false);
    }
  };

  // Step 3: set the new password and return the card to its starting state.
  const handleResetPassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsBusy(true);
    try {
      await post("/reset-password", { email, password }, "Unable to update password");

      sessionStorage.removeItem("resetEmail");
      setCode("");
      setPassword("");
      setConfirmPassword("");
      setResendTimer(0);
      setStep(1);
      setMessage("Password updated successfully. Use your new password next time you sign in.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update password");
    } finally {
      setIsBusy(false);
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setCode("");
    setPassword("");
    setConfirmPassword("");
    setResendTimer(0);
    setMessage("");
    setError("");
  };

  const inputClass = FIELD_INPUT;
  const labelClass = FIELD_LABEL;

  return (
    <div>
      <div className="mb-6">
        <h2 className={TAB_TITLE}>Change Password</h2>
        <p className={TAB_SUBTITLE}>Verify your email, then set a new password.</p>
      </div>

      <div className={`${CARD} p-6 max-w-xl`}>
        <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#2196F3] flex items-center justify-center mb-4">
          <HiOutlineLockClosed className="text-2xl" />
        </div>

        <h3 className="text-lg font-semibold text-[#22262A] mb-2">
          Reset password{email ? ` for ${email}` : ""}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {step === 1 &&
            "A verification code will be sent to your account email. Enter it here and you can create a new password without leaving this page."}
          {step === 2 && "Enter the 6-digit code we emailed to your account address."}
          {step === 3 && "Create a new password for your account."}
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  step > item.id
                    ? "bg-green-50 text-green-700"
                    : step === item.id
                    ? "bg-[#2196F3] text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {step > item.id ? <FiCheckCircle /> : item.id}
              </span>
              <span
                className={`text-xs font-medium ${
                  step >= item.id ? "text-[#22262A]" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
              {index < STEPS.length - 1 && <span className="w-4 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {message && <p className="text-sm text-green-600 mb-4">{message}</p>}

        {step === 1 && (
          <button
            type="button"
            onClick={() => handleSendCode(false)}
            disabled={isBusy || !email}
            className={BUTTON_PRIMARY}
          >
            {isBusy ? "Sending..." : "Send Verification Code"}
          </button>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div>
              <label htmlFor="reset-code" className={labelClass}>
                Verification code
              </label>
              <input
                id="reset-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter your 6-digit code"
                className={`${inputClass} tracking-[0.35em] font-semibold`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isBusy || code.length !== 6}
                className={BUTTON_PRIMARY}
              >
                {isBusy ? "Verifying..." : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={() => handleSendCode(true)}
                disabled={isBusy || resendTimer > 0}
                className="text-sm font-semibold text-[#2196F3] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label htmlFor="new-password" className={labelClass}>
                New Password
              </label>
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className={labelClass}>
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter new password"
                className={inputClass}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
                className="w-4 h-4 accent-[#2196F3] rounded"
              />
              Show password
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isBusy}
                className={BUTTON_PRIMARY}
              >
                {isBusy ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordTab;
