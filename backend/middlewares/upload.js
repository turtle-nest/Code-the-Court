// backend/middlewares/upload.js
// Middleware: handle PDF uploads with Multer

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../uploads/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  if (isDev) console.log('📂 Created uploads/ folder');
}

// Configure storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

// Restrict to PDF files only
const fileFilter = (req, file, cb) => {
  const allowed = /pdf/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Initialize Multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

module.exports = upload;
