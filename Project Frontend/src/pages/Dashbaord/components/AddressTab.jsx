import { useEffect, useState } from "react";
import { FiEdit2, FiMapPin, FiPlus, FiTrash2 } from "react-icons/fi";

const emptyForm = {
  label: "Home",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Pakistan",
};

const AddressTab = ({ addresses = [], onSaveAddresses }) => {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(addresses.length === 0);

  useEffect(() => {
    if (addresses.length === 0) setIsFormOpen(true);
  }, [addresses.length]);

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanedAddress = {
      ...form,
      label: form.label.trim() || "Home",
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zipCode: form.zipCode.trim(),
      country: form.country.trim() || "Pakistan",
    };

    if (!cleanedAddress.street || !cleanedAddress.city || !cleanedAddress.state || !cleanedAddress.zipCode) {
      return;
    }

    if (editingId) {
      onSaveAddresses(
        addresses.map((address) =>
          address.id === editingId ? { ...cleanedAddress, id: editingId, isDefault: address.isDefault } : address
        )
      );
    } else {
      onSaveAddresses([
        ...addresses,
        { ...cleanedAddress, id: Date.now(), isDefault: addresses.length === 0 },
      ]);
    }

    resetForm();
  };

  const handleEdit = (address) => {
    setForm({
      label: address.label || "Home",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      country: address.country || "Pakistan",
    });
    setEditingId(address.id);
    setIsFormOpen(true);
  };

  const handleDelete = (addressId) => {
    const remainingAddresses = addresses.filter((address) => address.id !== addressId);
    const hasDefault = remainingAddresses.some((address) => address.isDefault);
    onSaveAddresses(
      hasDefault || remainingAddresses.length === 0
        ? remainingAddresses
        : remainingAddresses.map((address, index) => ({ ...address, isDefault: index === 0 }))
    );
  };

  const handleDefault = (addressId) => {
    onSaveAddresses(addresses.map((address) => ({ ...address, isDefault: address.id === addressId })));
  };

  const inputClass =
    "w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded outline-none focus:ring-2 focus:ring-[#2196F3]/40";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#22262A]">Addresses</h2>
        <button
          type="button"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-4 py-2.5 rounded transition-colors"
        >
          <FiPlus />
          Add Address
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.label} onChange={(event) => updateField("label", event.target.value)} className={inputClass} placeholder="Label" />
            <input value={form.country} onChange={(event) => updateField("country", event.target.value)} className={inputClass} placeholder="Country" />
            <input value={form.street} onChange={(event) => updateField("street", event.target.value)} className={`${inputClass} md:col-span-2`} placeholder="Street address" />
            <input value={form.city} onChange={(event) => updateField("city", event.target.value)} className={inputClass} placeholder="City" />
            <input value={form.state} onChange={(event) => updateField("state", event.target.value)} className={inputClass} placeholder="State" />
            <input value={form.zipCode} onChange={(event) => updateField("zipCode", event.target.value)} className={inputClass} placeholder="Zip code" />
          </div>
          <div className="flex gap-3 mt-5">
            <button type="submit" className="bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-5 py-2.5 rounded transition-colors">
              {editingId ? "Update Address" : "Save Address"}
            </button>
            {addresses.length > 0 && (
              <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <FiMapPin className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved addresses</h3>
          <p className="text-sm text-gray-600">Add an address here or place an order to save your checkout address.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold text-[#22262A]">{address.label || "Home"}</h3>
                  {address.isDefault && <span className="text-xs font-semibold text-[#2196F3]">Default address</span>}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleEdit(address)} className="text-[#2196F3] hover:text-[#1a7fd1]" aria-label="Edit address">
                    <FiEdit2 />
                  </button>
                  <button type="button" onClick={() => handleDelete(address.id)} className="text-red-600 hover:text-red-700" aria-label="Delete address">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {address.street}<br />
                {address.city}, {address.state} {address.zipCode}<br />
                {address.country}
              </p>
              {!address.isDefault && (
                <button type="button" onClick={() => handleDefault(address.id)} className="mt-4 text-sm font-semibold text-[#2196F3] hover:text-[#1a7fd1]">
                  Make default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressTab;
