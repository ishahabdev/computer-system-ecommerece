import React, { useEffect, useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import axios from "axios";
import * as Yup from 'yup';
import { MdModeEdit, MdDashboard, MdPeople, MdSettings, MdLogout } from "react-icons/md";
import { FaTrash, FaUserPlus, FaList } from "react-icons/fa6";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { useNavigate } from 'react-router';
import Typography from './common/Typography';
import InputField from './home/input';


// User Form Component
const UserForm = ({ sigleUser, loader, createUser, updateUser, setSingleUser }) => {
    const initialValues = {
        firstName: sigleUser?.firstName || '',
        lastName: sigleUser?.lastName || '',
        email: sigleUser?.email || '',
        password: ''
    };

    return (
        <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={Yup.object({
                firstName: Yup.string().required('Required'),
                lastName: Yup.string().required('Required'),
                email: Yup.string().email('Invalid email address').required('Required'),
                password: Yup.string().when('$isEdit', {
                    is: false,
                    then: (schema) => schema.required('Password is required'),
                    otherwise: (schema) => schema.notRequired()
                })
            })}
            onSubmit={(values, { resetForm }) => {
                const updatedBody = values;
                if (sigleUser?.id) {
                    updateUser(sigleUser?.id, updatedBody);
                } else {
                    createUser(values);
                }
                resetForm();
            }}
        >
            {({ values, handleChange }) => (
                <Form className='space-y-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <Typography varient="h3">{sigleUser?.id ? "Edit User" : "Add New User"}</Typography>
                        {sigleUser?.id && (
                            <button
                                type="button"
                                onClick={() => setSingleUser({})}
                                className='bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition'
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <div>
                        <label htmlFor="firstName" className='text-lg font-medium block mb-2'>First Name</label>
                        <InputField value={values?.firstName} onchange={handleChange} name="firstName" type="text" />
                        <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                        <label htmlFor="lastName" className='text-lg font-medium block mb-2'>Last Name</label>
                        <InputField value={values?.lastName} onchange={handleChange} name="lastName" type="text" />
                        <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                        <label htmlFor="email" className='text-lg font-medium block mb-2'>Email Address</label>
                        <InputField value={values?.email} onchange={handleChange} name="email" type="email" />
                        <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {!sigleUser?.id && (
                        <div>
                            <label htmlFor="password" className='text-lg font-medium block mb-2'>Password</label>
                            <InputField name="password" onchange={handleChange} type="password" />
                            <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                    )}

                    <button type="submit" className='bg-blue-800 hover:bg-blue-900 py-3 px-6 rounded-lg text-white transition w-full'>
                        {loader ? "Saving..." : sigleUser?.id ? "Update User" : "Create User"}
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default UserForm