import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-black text-[#2196F3]">404</p>
      <h1 className="text-2xl font-bold mt-4">Page not found</h1>
      <p className="text-gray-500 mt-2 text-sm max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
            <Link
        to="/"
        className="mt-6 bg-[#2196F3] text-white text-sm font-medium px-6 py-3 rounded-md hover:bg-[#1a7fd1] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
