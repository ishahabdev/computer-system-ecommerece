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

// A product's gallery is capped so a single submission can't write an unbounded
// number of files to disk. The store detail page shows a main image + thumbnails;
// 8 is comfortably more than that needs.
const MAX_IMAGES = 8;

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

const multerOptions = {
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only JPEG, PNG, WebP, GIF or AVIF images are allowed"));
  },
};

const singleImageUpload = multer(multerOptions).single("image");
const multiImageUpload = multer(multerOptions).array("images", MAX_IMAGES);

// Multer reports a rejected upload by passing an error to its callback. Left to
// Express's default handler it becomes an HTML error page the admin form cannot
// show, so each rejection is converted to the JSON shape the rest of the API uses.
const translateUploadError = (error) => {
  if (error.code === "LIMIT_FILE_SIZE") return "Each image must be 5MB or smaller";
  // Raised both when too many files arrive and when a file shows up under an
  // unexpected field name — the actionable message for the admin is the count cap.
  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return `You can upload at most ${MAX_IMAGES} images`;
  }
  return error.message;
};

// Single-file upload (field "image"). Retained for any caller still sending one file.
export const uploadProductImage = (req, res, next) => {
  singleImageUpload(req, res, (error) => {
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: translateUploadError(error) });
    }
    next();
  });
};

// Multi-file gallery upload (field "images", up to MAX_IMAGES). Used by product create.
export const uploadProductImages = (req, res, next) => {
  multiImageUpload(req, res, (error) => {
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: translateUploadError(error) });
    }
    next();
  });
};

export { UPLOADS_DIR, MAX_IMAGES };
