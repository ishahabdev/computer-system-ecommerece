import nodemailer from "nodemailer";
import contactEmailTemplate from "../utils/contact-email-template.js";

// Every message from the Contact Us page lands in this inbox.
const CONTACT_RECEIVER_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || "ishahabdev@gmail.com";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// CONTACT US: emails the visitor's message to the store inbox
export const sendContactMessage = async (req, res) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are all required",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters",
      });
    }

    await transporter.sendMail({
      from: `"YourStore Contact" <${process.env.EMAIL_USER}>`,
      to: CONTACT_RECEIVER_EMAIL,
      replyTo: `"${name}" <${email}>`, // hitting Reply answers the customer, not the store
      subject: `New contact message from ${name}`,
      html: contactEmailTemplate({
        name,
        email,
        message,
        receivedAt: new Date().toLocaleString(),
      }),
    });

    res.json({ success: true, message: "Your message has been sent successfully" });
  } catch (error) {
    console.error("Contact message failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not send your message right now, please try again later",
      error: error.message,
    });
  }
};
