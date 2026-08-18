import { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineLockClosed } from "react-icons/hi2";

const API_BASE_URL = "http://localhost:9000/v1";

const ChangePasswordTab = ({ user }) => {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendResetCode = async () => {
    setMessage("");
    setError("");

    if (!user?.email) {
      setError("No email address is available for this account.");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false || data.status === false) {
        throw new Error(data.message || "Unable to send verification code");
      }

      sessionStorage.setItem("resetEmail", user.email);
      setMessage("Verification code sent. Continue on the reset password page.");
    } catch (requestError) {
      setError(requestError.message || "Unable to send verification code");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#22262A] mb-6">Change Password</h2>

      <div className="border border-gray-200 rounded-lg p-6 max-w-xl">
        <div className="w-12 h-12 rounded bg-blue-50 text-[#2196F3] flex items-center justify-center mb-4">
          <HiOutlineLockClosed className="text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-[#22262A] mb-2">Reset password for {user?.email}</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          A verification code will be sent to your account email. After verification, you can create a new password through the existing secure reset flow.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {message && <p className="text-sm text-green-600 mb-4">{message}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSendResetCode}
            disabled={isSending}
            className="bg-[#2196F3] hover:bg-[#1a7fd1] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-3 rounded transition-colors"
          >
            {isSending ? "Sending..." : "Send Verification Code"}
          </button>
          <Link to="/forgot-password" className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold px-6 py-3 rounded transition-colors">
            Open Reset Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordTab;
