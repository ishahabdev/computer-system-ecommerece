import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiMail, FiUser, FiCamera, FiX } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const SettingsTab = ({ user }) => {
  const { updateProfilePicture } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreviewImage(base64String);
        
        // Update profile picture
        const result = updateProfilePicture(base64String);
        
        if (result.success) {
          showToast('Profile picture updated successfully!', 'success');
        } else {
          showToast(result.error || 'Failed to update profile picture', 'error');
          setPreviewImage(null);
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        showToast('Failed to read image file', 'error');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showToast('Failed to upload image', 'error');
      setIsUploading(false);
    }
  };

  const handleRemoveProfilePicture = () => {
    const result = updateProfilePicture(null);
    if (result.success) {
      setPreviewImage(null);
      showToast('Profile picture removed', 'info');
    } else {
      showToast('Failed to remove profile picture', 'error');
    }
  };

  const currentProfilePicture = previewImage || user.profilePicture;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#22262A] mb-6">Account Settings</h2>

      {/* Profile Picture Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#22262A] mb-4 flex items-center gap-2">
          <FiCamera className="text-[#2196F3]" />
          Profile Picture
        </h3>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            {currentProfilePicture ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#2196F3]">
                <img 
                  src={currentProfilePicture} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#2196F3] text-white text-2xl font-bold flex items-center justify-center border-4 border-[#2196F3]">
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-3">
              Upload a profile picture to personalize your account. Recommended size: 400x400px
            </p>
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleProfilePictureClick}
                disabled={isUploading}
                className="bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiCamera />
                {currentProfilePicture ? 'Change Picture' : 'Upload Picture'}
              </button>
              
              {currentProfilePicture && (
                <button
                  onClick={handleRemoveProfilePicture}
                  disabled={isUploading}
                  className="bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FiX />
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Max file size: 5MB. Supported formats: JPG, PNG, GIF
            </p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#22262A] mb-4 flex items-center gap-2">
          <FiUser className="text-[#2196F3]" />
          Personal Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={user.name}
              readOnly
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded outline-none cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Contact support to update your name
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiMail className="text-sm" />
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded outline-none cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your email is used for login and order notifications
            </p>
          </div>
        </div>
      </div>

      {/* Password & Security */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#22262A] mb-4 flex items-center gap-2">
          <FiLock className="text-[#2196F3]" />
          Password & Security
        </h3>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
          <div>
            <p className="font-medium text-[#22262A] text-sm">Password</p>
            <p className="text-xs text-gray-600 mt-0.5">••••••••</p>
          </div>
          <Link
            to="/forgot-password"
            className="text-[#2196F3] hover:underline text-sm font-medium"
          >
            Change Password
          </Link>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#22262A] mb-4">
          Preferences
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[#22262A] text-sm">Email Notifications</p>
              <p className="text-xs text-gray-600 mt-0.5">Receive order updates and promotions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2196F3]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[#22262A] text-sm">Order Updates via SMS</p>
              <p className="text-xs text-gray-600 mt-0.5">Get shipping notifications by text</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2196F3]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[#22262A] text-sm">Newsletter Subscription</p>
              <p className="text-xs text-gray-600 mt-0.5">Weekly deals and new arrivals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2196F3]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-red-800 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
