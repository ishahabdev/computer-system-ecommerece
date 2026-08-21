import { useState } from "react";
import { HiBriefcase, HiHome, HiMapPin, HiOutlinePlus, HiPhone } from "react-icons/hi2";

const emptyForm = {
  fullName: "",
  phone: "",
  label: "Home",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Pakistan",
};

// The card icon follows the label so Home/Office read differently at a glance.
const getAddressIcon = (label) => {
  const normalizedLabel = (label || "").toLowerCase();
  if (normalizedLabel.includes("office") || normalizedLabel.includes("work")) return HiBriefcase;
  if (normalizedLabel.includes("home") || normalizedLabel.includes("house")) return HiHome;
  return HiMapPin;
};

const AddressTab = ({ addresses = [], onSaveAddresses, user }) => {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(addresses.length === 0);
  const [formError, setFormError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
    setFormError("");
  };

  const openNewForm = () => {
    // Prefill the recipient from the signed-in profile so most saves are one step.
    setForm({ ...emptyForm, fullName: user?.name || "", phone: user?.phone || "" });
    setEditingId(null);
    setFormError("");
    setIsFormOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanedAddress = {
      fullName: form.fullName.trim() || user?.name || "",
      phone: form.phone.trim(),
      label: form.label.trim() || "Home",
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zipCode: form.zipCode.trim(),
      country: form.country.trim() || "Pakistan",
    };

    if (!cleanedAddress.street || !cleanedAddress.city || !cleanedAddress.state || !cleanedAddress.zipCode) {
      setFormError("Street address, city, state and zip code are all required.");
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
      fullName: address.fullName || user?.name || "",
      phone: address.phone || "",
      label: address.label || "Home",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      country: address.country || "Pakistan",
    });
    setEditingId(address.id);
    setFormError("");
    setConfirmingId(null);
    setIsFormOpen(true);
  };

  const handleDelete = (addressId) => {
    setConfirmingId(null);
    const remainingAddresses = addresses.filter((address) => address.id !== addressId);
    const hasDefault = remainingAddresses.some((address) => address.isDefault);
    onSaveAddresses(
      hasDefault || remainingAddresses.length === 0
        ? remainingAddresses
        : remainingAddresses.map((address, index) => ({ ...address, isDefault: index === 0 }))
    );
    // Removing the last address leaves nothing to show, so offer the form again.
    if (remainingAddresses.length === 0) openNewForm();
  };

  const handleDefault = (addressId) => {
    onSaveAddresses(addresses.map((address) => ({ ...address, isDefault: address.id === addressId })));
  };

  const labelClass = "block text-sm font-medium text-gray-700 mb-2";
  const inputClass =
    "w-full bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-[#2196F3]/40 transition";
  const linkClass = "text-sm font-medium text-[#2196F3] hover:underline transition-colors";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#22262A]">Your Addresses</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your shipping and billing locations.</p>
        </div>
        <button
          type="button"
          onClick={openNewForm}
          className="inline-flex items-center justify-center gap-2 shrink-0 bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-4 py-2.5 rounded-md transition-colors"
        >
          <HiOutlinePlus className="text-base" />
          Add New Address
        </button>
      </div>

      {/* Add / edit form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#22262A] mb-4">
            {editingId ? "Edit address" : "Add a new address"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-3">
              <label htmlFor="address-fullName" className={labelClass}>Full name</label>
              <input
                id="address-fullName"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className={inputClass}
                placeholder="Jane Doe"
              />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="address-phone" className={labelClass}>Phone number</label>
              <input
                id="address-phone"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className={inputClass}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="address-label" className={labelClass}>Label</label>
              <input
                id="address-label"
                value={form.label}
                onChange={(event) => updateField("label", event.target.value)}
                className={inputClass}
                placeholder="Home, Office, etc."
              />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="address-country" className={labelClass}>Country</label>
              <input
                id="address-country"
                value={form.country}
                onChange={(event) => updateField("country", event.target.value)}
                className={inputClass}
                placeholder="Country"
              />
            </div>
            <div className="md:col-span-6">
              <label htmlFor="address-street" className={labelClass}>Street address</label>
              <input
                id="address-street"
                value={form.street}
                onChange={(event) => updateField("street", event.target.value)}
                className={inputClass}
                placeholder="1234 Silicon Valley Blvd, Suite 500"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address-city" className={labelClass}>City</label>
              <input
                id="address-city"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                className={inputClass}
                placeholder="San Francisco"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address-state" className={labelClass}>State</label>
              <input
                id="address-state"
                value={form.state}
                onChange={(event) => updateField("state", event.target.value)}
                className={inputClass}
                placeholder="CA"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address-zipCode" className={labelClass}>Zip code</label>
              <input
                id="address-zipCode"
                value={form.zipCode}
                onChange={(event) => updateField("zipCode", event.target.value)}
                className={inputClass}
                placeholder="94107"
              />
            </div>
          </div>

          {formError && <p className="text-sm text-red-600 mt-4">{formError}</p>}

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="submit"
              className="bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
            >
              {editingId ? "Update Address" : "Save Address"}
            </button>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Address cards + the dashed "add another" tile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {addresses.map((address) => {
          const AddressIcon = getAddressIcon(address.label);
          const recipientName = address.fullName || user?.name;
          const isConfirmingDelete = confirmingId === address.id;

          return (
            <div
              key={address.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col"
            >
              {/* Label + default badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AddressIcon className="text-lg text-gray-700 shrink-0" />
                  <h3 className="font-semibold text-[#22262A] truncate">{address.label || "Home"}</h3>
                </div>
                {address.isDefault && (
                  <span className="shrink-0 bg-green-50 border border-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>

              {/* Recipient + address lines */}
              <div className="mt-4 flex-1">
                {recipientName && (
                  <p className="text-sm font-semibold text-[#22262A] mb-1.5">{recipientName}</p>
                )}
                <p className="text-sm text-gray-500 leading-relaxed break-words">
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.zipCode}
                  <br />
                  {address.country}
                </p>
                {address.phone && (
                  <p className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                    <HiPhone className="text-xs text-gray-400 shrink-0" />
                    <span className="break-words">{address.phone}</span>
                  </p>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between gap-3 flex-wrap mt-4 pt-3 border-t border-gray-100">
                {isConfirmingDelete ? (
                  <>
                    <span className="text-sm text-gray-600">Remove this address?</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(address.id)}
                        className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline transition-colors"
                      >
                        Confirm
                      </button>
                      <span className="text-gray-300" aria-hidden="true">|</span>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      {!address.isDefault && (
                        <>
                          <button type="button" onClick={() => handleDefault(address.id)} className={linkClass}>
                            Set as Default
                          </button>
                          <span className="text-gray-300" aria-hidden="true">|</span>
                        </>
                      )}
                      <button type="button" onClick={() => handleEdit(address)} className={linkClass}>
                        Edit
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(address.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Dashed placeholder tile — hidden while the form is already open */}
        {!isFormOpen && (
          <button
            type="button"
            onClick={openNewForm}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 min-h-[190px] flex flex-col items-center justify-center text-center hover:border-[#2196F3]/50 hover:bg-blue-50/40 transition-colors"
          >
            <span className="w-11 h-11 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
              <HiOutlinePlus className="text-xl" />
            </span>
            <span className="text-sm font-semibold text-[#22262A] mt-4">
              {addresses.length === 0 ? "Add your first address" : "Add another address"}
            </span>
            <span className="text-xs text-gray-500 mt-1 max-w-[220px]">
              Save another location for quicker checkout next time.
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressTab;
