import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import multer from "multer";

// Resolved from this file rather than process.cwd(), so uploads land in
// "project backend/uploads" no matter which directory the server was started from.
const UPLOADS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "uploads",
);

// Created up front: multer errors on a missing destination rather than making it.
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    // The original filename is deliberately discarded: it is attacker-controlled
    // and can carry path separators ("../") or collide with an existing upload.
    // Only the extension is kept, so the served file keeps a usable content type.
    const extension = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${unique}${extension}`);
  },
});

const singleImageUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only JPEG, PNG, WebP, GIF or AVIF images are allowed"));
  },
}).single("image");

// Multer reports a rejected upload (too large, wrong type) by passing an error to
// its callback. Left to Express's default handler that becomes an HTML error page,
// which the admin form cannot show, so it is converted to the JSON shape the rest
// of the API uses.
export const uploadProductImage = (req, res, next) => {
  singleImageUpload(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Image must be 5MB or smaller"
            : error.message,
      });
    }
    next();
  });
};

export { UPLOADS_DIR };
