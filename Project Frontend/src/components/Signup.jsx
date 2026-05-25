import React, { useEffect, useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import InputField from "./home/input";

const API = "http://localhost:9000/v1/user/";

const SignupForm = () => {
  const [users, setUsers] = useState([]);

  // GET USERS
  const getUsers = async () => {
    try {
      const res = await axios.get(API);
      setUsers(res.data.data || []);
    } catch (err) {
      console.log("GET ERROR:", err);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // CREATE USER
  const createUser = async (values, { resetForm, setSubmitting }) => {
    try {
      setSubmitting(true);
      console.log("SENDING DATA:", values);
      
      const res = await axios.post(API, values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      console.log("RESPONSE:", res.data);
      resetForm();
      getUsers();
    } catch (err) {
      console.log("POST ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error creating user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Form Section */}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up Form</h2>
        
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            password: "",
          }}
          validationSchema={Yup.object({
            firstName: Yup.string().required("First name is required"),
            lastName: Yup.string().required("Last name is required"),
            email: Yup.string().email("Invalid email format").required("Email is required"),
            password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
          })}
          onSubmit={createUser}
        >
          {({ isSubmitting, values, handleChange, errors, touched }) => (
            <Form>
              <InputField
                name="firstName"
                type="text"
                value={values.firstName}
                onChange={handleChange}
                placeholder="First Name"
                error={touched.firstName && errors.firstName}
              />
              
              <InputField
                name="lastName"
                type="text"
                value={values.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                error={touched.lastName && errors.lastName}
              />
              
              <InputField
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                placeholder="Email Address"
                error={touched.email && errors.email}
              />
              
              <InputField
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Password"
                error={touched.password && errors.password}
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {isSubmitting ? "Creating User..." : "Create User"}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      {/* Users Table Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Registered Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">ID</th>
                <th className="border border-gray-300 p-2 text-left">First Name</th>
                <th className="border border-gray-300 p-2 text-left">Last Name</th>
                <th className="border border-gray-300 p-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">{u.id}</td>
                    <td className="border border-gray-300 p-2">{u.firstName}</td>
                    <td className="border border-gray-300 p-2">{u.lastName}</td>
                    <td className="border border-gray-300 p-2">{u.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="border border-gray-300 p-2 text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;