import React from 'react';

const HomeTab = ({ user }) => {
  // Get user initials for avatar
  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#22262A] mb-6">Home</h2>
      
      {/* User Profile Section */}
      <div className="flex items-start gap-6 mb-6">
        {/* User Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2196F3] to-[#1976d2] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg">
          {initials}
        </div>
        
        {/* User Info */}
        <div>
          <h3 className="text-xl font-bold text-[#22262A] mb-1">
            {user.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {user.email}
          </p>
        </div>
      </div>

      {/* Welcome Message Box */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-base font-semibold text-[#22262A] mb-3">
          Hello {user.name.split(' ')[0]}!
        </h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          Welcome to your account dashboard. From here you can view your recent orders, 
          manage your shipping addresses, and edit your account settings. We're committed 
          to providing you with the best shopping experience for all your computer system needs. 
          Thank you for being a valued customer!
        </p>
      </div>
    </div>
  );
};

export default HomeTab;
