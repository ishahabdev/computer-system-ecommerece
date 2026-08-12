import React, { useState } from 'react';
import { FiMapPin, FiPlus } from 'react-icons/fi';

const AddressTab = () => {
  const [addresses, setAddresses] = useState([]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#22262A]">Saved Addresses</h2>
        <button className="flex items-center gap-2 bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
          <FiPlus className="text-base" />
          Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <FiMapPin className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved addresses</h3>
          <p className="text-sm text-gray-600 mb-6">
            Addresses will be saved from your checkout for faster ordering next time.
          </p>
          <button className="bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors">
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-[#2196F3] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-[#22262A]">
                  {address.label || 'Home'}
                </h3>
                <div className="flex gap-2">
                  <button className="text-[#2196F3] text-sm hover:underline">
                    Edit
                  </button>
                  <button className="text-red-600 text-sm hover:underline">
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {address.street}<br />
                {address.city}, {address.state} {address.zipCode}<br />
                {address.country}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Information Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          💡 Address Management
        </h4>
        <p className="text-sm text-blue-800">
          Saved addresses make checkout faster and easier. Your addresses are securely stored 
          and can be used for future orders. You can add, edit, or remove addresses anytime.
        </p>
      </div>
    </div>
  );
};

export default AddressTab;
