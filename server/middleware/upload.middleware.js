const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';
const uploadDir = isProduction
  ? '/var/www/images/welcome-image'
  : path.join(__dirname, '..', '..', 'uploads', 'welcome-image');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
    cb(null, `welcome-image-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/gif') {
      return cb(new Error('GIF files are not supported'));
    }
    // Accept standard images and common mobile formats
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/bmp', 'image/tiff', 'image/heic', 'image/heif'];
    if (!allowedMimes.includes(file.mimetype) && !file.originalname.match(/\.(jpg|jpeg|png|webp|avif|bmp|tiff|heic|heif)$/i)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  }
});

module.exports = {
  upload,
  uploadDir
};
