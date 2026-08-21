import { useEffect, useState } from "react";

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
      <h2 className="text-2xl font-bold text-[#22262A] mb-6">Profile</h2>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E5E5E0] rounded-lg p-6 max-w-2xl">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-[#2196F3] text-white flex items-center justify-center overflow-hidden text-2xl font-bold">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user?.name || "Profile"} className="w-full h-full object-cover" />
            ) : (
              (user?.name || "U").slice(0, 1).toUpperCase()
            )}
          </div>
          <div>
            <label className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold px-4 py-2 rounded cursor-pointer transition-colors">
              Change Photo
              <input type="file" accept="image/*" onChange={handlePictureChange} className="hidden" />
            </label>
            <p className="text-xs text-gray-500 mt-2">Saved to this customer profile.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded outline-none focus:ring-2 focus:ring-[#2196F3]/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded outline-none focus:ring-2 focus:ring-[#2196F3]/40"
              placeholder="Optional"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full bg-gray-100 border border-gray-200 text-gray-500 px-4 py-3 rounded outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        {message && <p className="text-sm text-green-600 mt-4">{message}</p>}

        <button
          type="submit"
          className="mt-6 bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-6 py-3 rounded transition-colors"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileTab;
