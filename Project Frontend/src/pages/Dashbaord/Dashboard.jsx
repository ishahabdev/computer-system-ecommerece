import axios from "axios"; // ✅ FIX 1: axios import added
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import {
  MdDashboard,
  MdPeople,
  MdDelete,
  MdModeEdit,
  MdClose,
  MdAddBox,
} from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { FaBoxOpen } from "react-icons/fa";

function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [editUser, setEditUser] = useState(null); // ✅ FIX 2: editUser state added

  // ✅ USER FORM STATE
  const [form, setForm] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // ================= USERS =================

  const createUser = async (data) => {
    try {
      await axios.post("http://localhost:9000/v1/user/", data);
      getUsers();
    } catch (error) {
      console.error("Create Error:", error.response?.data || error.message);
    }
  };
  
  //  GET USERS
  const getUsers = async () => {
    try {
      const response = await axios.get("http://localhost:9000/v1/users/");
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Fetch Error:", error.message);
    }
  };

  //  DELETE USER
  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:9000/v1/user/${id}`);
      getUsers();
    } catch (error) {
      console.error("Delete Error:", error.response?.data || error.message);
    }
  };

  //  UPDATE USER
  const updateUser = async () => {
    try {
      await axios.put(`http://localhost:9000/v1/user/${editUser.id}`, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
      });
      setEditUser(null);
      getUsers();
    } catch (error) {
      console.error("Update Error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  //  FIX 3: handleSubmit cleaned — no duplicate deleteUser/editUser, calls API functions
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      return alert("Fill all fields");
    }
    try {
      if (form.id) {
        await updateUser();
      } else {
        await createUser({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        });
      }
      setForm({ id: null, firstName: "", lastName: "", email: "", password: "" });
    } catch (err) {
      console.log(err);
    }
  };

  // ================= CATEGORY =================
  const saveCategory = () => {
    if (!category) return;
    setCategories([...categories, category]);
    setCategory("");
  };

  // ================= PRODUCT FORMIK =================
  const productFormik = useFormik({
    initialValues: {
      productName: "",
      price: "",
      category: "",
      availability: "",
      freeShipping: false,
      description: "",
      image: null,
    },
    validate: (values) => {
      const errors = {};
      if (!values.productName) errors.productName = "Product name required";
      if (!values.price) errors.price = "Price required";
      else if (isNaN(values.price) || Number(values.price) <= 0)
        errors.price = "Enter valid price";
      if (!values.category) errors.category = "Select a category";
      if (!values.availability) errors.availability = "Select availability";
      if (!values.description) errors.description = "Description required";
      return errors;
    },
    onSubmit: (values, { resetForm }) => {
      const newProduct = {
        ...values,
        id: Date.now(),
        image: values.image ? URL.createObjectURL(values.image) : null,
      };
      setProducts([...products, newProduct]);
      resetForm();
      setShowProductForm(false);
    },
  });

  // ================= UI =================
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-700">
          🛠 Dashboard
        </div>

        <button
          onClick={() => setActiveMenu("dashboard")}
          className={`p-4 flex gap-2 items-center hover:bg-gray-700 transition ${activeMenu === "dashboard" && "bg-blue-600"}`}
        >
          <MdDashboard size={18} /> Dashboard
        </button>

        <button
          onClick={() => setActiveMenu("users")}
          className={`p-4 flex gap-2 items-center hover:bg-gray-700 transition ${activeMenu === "users" && "bg-blue-600"}`}
        >
          <MdPeople size={18} /> Users
        </button>

        <button
          onClick={() => setActiveMenu("category")}
          className={`p-4 flex gap-2 items-center hover:bg-gray-700 transition ${activeMenu === "category" && "bg-blue-600"}`}
        >
          <BiSolidCategoryAlt size={18} /> Category
        </button>

        <button
          onClick={() => setActiveMenu("products")}
          className={`p-4 flex gap-2 items-center hover:bg-gray-700 transition ${activeMenu === "products" && "bg-blue-600"}`}
        >
          <FaBoxOpen size={18} /> Products
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* DASHBOARD */}
        {activeMenu === "dashboard" && (
          <h1 className="text-2xl font-bold">Welcome Dashboard</h1>
        )}

        {/* USERS */}
        {activeMenu === "users" && (
          <div className="grid grid-cols-2 gap-6">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded shadow space-y-4"
            >
              <h2 className="text-xl font-bold">
                {form.id ? "Update User" : "Add User"}
              </h2>
              <input
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <button className="bg-blue-600 text-white w-full p-2 rounded">
                {form.id ? "Update User" : "Create User"}
              </button>
            </form>

            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">Users</h2>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="p-2">ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="text-center border">
                      <td className="p-2">{u.id}</td>
                      <td className="p-2">{u.firstName}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2 flex justify-center gap-2">
                        {/* ✅ FIX 4: inline setter instead of duplicate editUser function */}
                        <button
                          onClick={() => { setForm(u); setActiveMenu("users"); }}
                          className="bg-green-500 text-white p-1 rounded"
                        >
                          <MdModeEdit />
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="bg-red-500 text-white p-1 rounded"
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORY */}
        {activeMenu === "category" && (
          <div className="bg-white p-6 rounded shadow w-1/2">
            <h2 className="text-xl font-bold mb-4">Add Category</h2>
            <input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <button
              onClick={saveCategory}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <ul className="mt-5 space-y-2">
              {categories.map((c, i) => (
                <li key={i} className="p-2 bg-gray-100 rounded">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* PRODUCTS */}
        {activeMenu === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Products</h1>
              <button
                onClick={() => setShowProductForm(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md font-semibold transition"
              >
                <FaBoxOpen size={18} />
                Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="bg-white p-10 rounded shadow text-center text-gray-400">
                <FaBoxOpen size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg">
                  Koi product nahi mila. "Add Product" par click karein.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:border-gray-200 transition-all duration-200"
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.productName}
                        className="w-full h-36 object-cover"
                      />
                    ) : (
                      <div className="w-full h-36 bg-gray-50 flex flex-col items-center justify-center text-gray-300 gap-1 text-sm">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3l18 18" />
                        </svg>
                        No Image
                      </div>
                    )}

                    <div className="px-4 pt-3.5 pb-4">
                      <p className="font-medium text-gray-900 text-[15px] truncate">{p.productName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 mb-3">{p.category}</p>

                      <p className="text-xl font-medium text-gray-900">
                        Rs. {p.price}
                        <span className="text-xs text-gray-400 font-normal ml-1">/ piece</span>
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md ${
                          p.availability === "instock"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}>
                          {p.availability === "instock" ? "In Stock" : "Out of Stock"}
                        </span>
                        <span className={`text-[11px] flex items-center gap-1 ${
                          p.freeShipping ? "text-green-700" : "text-gray-400"
                        }`}>
                          🚚 {p.freeShipping ? "Free shipping" : "+ Shipping"}
                        </span>
                      </div>

                      <button
                        disabled={p.availability !== "instock"}
                        className="mt-3 w-full py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {p.availability === "instock" ? "🛒 Add to cart" : "🔔 Notify me"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ✅ PRODUCT FORM MODAL */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b bg-gray-900 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaBoxOpen /> Add New Product
                </h2>
                <button
                  onClick={() => {
                    setShowProductForm(false);
                    productFormik.resetForm();
                  }}
                  className="text-gray-300 hover:text-white transition"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <form onSubmit={productFormik.handleSubmit} className="p-6 space-y-4">
                {/* 1. Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    name="productName"
                    placeholder="Enter product name"
                    value={productFormik.values.productName} // ✅ FIX 5: was productNam
                    onChange={productFormik.handleChange}
                    onBlur={productFormik.handleBlur}
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      productFormik.touched.productName && productFormik.errors.productName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {productFormik.touched.productName && productFormik.errors.productName && (
                    <p className="text-red-500 text-xs mt-1">{productFormik.errors.productName}</p>
                  )}
                </div>

                {/* 2. Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Price (Rs.)
                  </label>
                  <input
                    name="price"
                    type="number"
                    placeholder="Enter price"
                    value={productFormik.values.price}
                    onChange={productFormik.handleChange}
                    onBlur={productFormik.handleBlur}
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      productFormik.touched.price && productFormik.errors.price
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {productFormik.touched.price && productFormik.errors.price && (
                    <p className="text-red-500 text-xs mt-1">{productFormik.errors.price}</p>
                  )}
                </div>

                {/* 3. Category Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={productFormik.values.category}
                    onChange={productFormik.handleChange}
                    onBlur={productFormik.handleBlur}
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                      productFormik.touched.category && productFormik.errors.category
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                  {productFormik.touched.category && productFormik.errors.category && (
                    <p className="text-red-500 text-xs mt-1">{productFormik.errors.category}</p>
                  )}
                </div>

                {/* 4. Availability */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={productFormik.values.availability}
                    onChange={productFormik.handleChange}
                    onBlur={productFormik.handleBlur}
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                      productFormik.touched.availability && productFormik.errors.availability
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">-- Select Availability --</option>
                    <option value="instock">In Stock</option>
                    <option value="outofstock">Out of Stock</option>
                  </select>
                  {productFormik.touched.availability && productFormik.errors.availability && (
                    <p className="text-red-500 text-xs mt-1">{productFormik.errors.availability}</p>
                  )}
                </div>

                {/* 5. Free Shipping */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    name="freeShipping"
                    id="freeShipping"
                    checked={productFormik.values.freeShipping}
                    onChange={productFormik.handleChange}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  <label
                    htmlFor="freeShipping"
                    className="text-sm font-semibold text-gray-700 cursor-pointer select-none"
                  >
                    Free Shipping Available
                  </label>
                </div>

                {/* 6. Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Product Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Write product description..."
                    value={productFormik.values.description}
                    onChange={productFormik.handleChange}
                    onBlur={productFormik.handleBlur}
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      productFormik.touched.description && productFormik.errors.description
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {productFormik.touched.description && productFormik.errors.description && (
                    <p className="text-red-500 text-xs mt-1">{productFormik.errors.description}</p>
                  )}
                </div>

                {/* 7. Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      productFormik.setFieldValue("image", e.currentTarget.files[0])
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
                  />
                  {productFormik.values.image && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(productFormik.values.image)}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* 8. Save Button */}
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 mt-2"
                >
                  <MdAddBox size={20} />
                  Save Product
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;