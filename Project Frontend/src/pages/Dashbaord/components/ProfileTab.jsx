import { useEffect, useState } from "react";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  FIELD_INPUT,
  FIELD_LABEL,
  TAB_SUBTITLE,
  TAB_TITLE,
} from "../dashboardStyles";

const resizeProfileImage = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const maxSize = 320;
      const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to process image."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image."));
    };

    image.src = objectUrl;
  });

const ProfileTab = ({ user, updateProfile, updateProfilePicture }) => {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
  }, [user]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required");
      return;
    }

    const result = updateProfile({ name: trimmedName, phone: phone.trim() });
    if (result.success) {
      setMessage("Profile updated successfully.");
    } else {
      setError(result.error || "Unable to update profile");
    }
  };

  const handlePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("");
    setError("");

    try {
      const resizedPicture = await resizeProfileImage(file);
      const result = updateProfilePicture(resizedPicture);
      if (result.success) setMessage("Profile picture updated successfully.");
      else setError(result.error || "Unable to update picture");
    } catch (pictureError) {
      setError(pictureError.message || "Unable to update picture");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className={TAB_TITLE}>Profile</h2>
        <p className={TAB_SUBTITLE}>Update the name, photo and phone number on your account.</p>
      </div>

      <form onSubmit={handleSubmit} className={`${CARD} p-6 max-w-2xl`}>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-[#2196F3] text-white flex items-center justify-center overflow-hidden text-2xl font-bold shrink-0">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user?.name || "Profile"} className="w-full h-full object-cover" />
            ) : (
              (user?.name || "U").slice(0, 1).toUpperCase()
            )}
          </div>
          <div>
            <label className={`${BUTTON_SECONDARY} cursor-pointer`}>
              Change Photo
              <input type="file" accept="image/*" onChange={handlePictureChange} className="hidden" />
            </label>
            <p className="text-xs text-gray-500 mt-2">Saved to this customer profile.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="profile-name" className={FIELD_LABEL}>Full Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={FIELD_INPUT}
            />
          </div>

          <div>
            <label htmlFor="profile-phone" className={FIELD_LABEL}>Phone</label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={FIELD_INPUT}
              placeholder="Optional"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="profile-email" className={FIELD_LABEL}>Email Address</label>
            <input
              id="profile-email"
              type="email"
              value={user?.email || ""}
              readOnly
              className={`${FIELD_INPUT} text-gray-500 cursor-not-allowed focus:bg-[#F7F7F5] focus:border-[#E5E5E0] focus:ring-0`}
            />
            <p className="text-xs text-gray-500 mt-2">
              Your email is used to sign in and cannot be changed here.
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        {message && <p className="text-sm text-green-600 mt-4">{message}</p>}

        <button type="submit" className={`${BUTTON_PRIMARY} mt-6`}>
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileTab;
