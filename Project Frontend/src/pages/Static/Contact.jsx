import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiHeart,
  FiTruck,
} from "react-icons/fi";
import { FaInstagram, FaYoutube, FaFacebookF, FaTwitter } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { usePageSEO } from '../../hooks/usePageSEO';
import { PAGE_SEO } from '../../utils/seo';

const NAV_LINKS = [
  { label: "HOME", to: "/" },
  { label: "Store", to: "/store" },
  { label: "Mouse", to: "/mouse" },
  { label: "Keyboard", to: "/keyboard" },
  { label: "Accessories", to: "/accessories" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
];

const FOOTER_COLUMNS = [
  { title: "Useful Links", links: ["Home", "Store", "Accessories", "About Us"] },
  { title: "Our Offers", links: ["About Us", "Information", "Privacy Policy", "Terms & Conditions"] },
];

const API_BASE_URL = "http://localhost:9000/v1";

const ContactSchema = Yup.object().shape({
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  message: Yup.string().min(10, "Message must be at least 10 characters").required("Message is required"),
});

export default function Contact() {
  usePageSEO(PAGE_SEO.contact.title, PAGE_SEO.contact.description);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Sends the message to the store inbox through the backend contact endpoint.
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setSubmitError(data.message || "Could not send your message, please try again.");
        return;
      }

      setSubmitSuccess(true);
      resetForm();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch {
      setSubmitError("Network error, please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-white text-sm text-gray-700 placeholder-gray-400 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400/40 transition border border-gray-200";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Contact content */}
      <section className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
        <h1 className="text-center text-sky-500 font-bold text-lg mb-6">Contact Us</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-8">We're Just a Click Away</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center flex-shrink-0">
                <FiPhone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Phone Number</p>
                <p className="text-sm text-slate-500">+44 123 456 789</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center flex-shrink-0">
                <FiMail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Email Address</p>
                <p className="text-sm text-slate-500">ishahabdevv@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center flex-shrink-0">
                <FiMapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Our Store</p>
                <p className="text-sm text-slate-500">Street 7, new Cat6, London, UK</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-slate-50 rounded-md p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Send Us Message</h3>

            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-xs text-green-600 text-center">
                  Thank you for your message! We'll get back to you soon.
                </p>
              </div>
            )}

            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-600 text-center">{submitError}</p>
              </div>
            )}

            <Formik
              initialValues={{ name: "", email: "", message: "" }}
              validationSchema={ContactSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs text-slate-500 mb-1.5">
                        Name
                      </label>
                      <Field
                        id="name"
                        name="name"
                        type="text"
                        placeholder="User name"
                        className={`${inputClass} ${
                          errors.name && touched.name ? "ring-2 ring-red-500/40" : ""
                        }`}
                      />
                      <ErrorMessage name="name" component="div" className={errorClass} />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs text-slate-500 mb-1.5">
                        Email
                      </label>
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        placeholder="myemail@email.com"
                        className={`${inputClass} ${
                          errors.email && touched.email ? "ring-2 ring-red-500/40" : ""
                        }`}
                      />
                      <ErrorMessage name="email" component="div" className={errorClass} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs text-slate-500 mb-1.5">
                      Message here
                    </label>
                    <Field
                      id="message"
                      name="message"
                      as="textarea"
                      rows="5"
                      placeholder="Your message"
                      className={`${inputClass} resize-none ${
                        errors.message && touched.message ? "ring-2 ring-red-500/40" : ""
                      }`}
                    />
                    <ErrorMessage name="message" component="div" className={errorClass} />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </section>

      {/* Map */}
      <div className="w-full h-[320px] sm:h-[380px]">
        <iframe
          title="Store location map"
          src="https://www.openstreetmap.org/export/embed.html?bbox=0.05%2C52.15%2C0.20%2C52.25&layer=mapnik"
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>

    </div>
  );
}