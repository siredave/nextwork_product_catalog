const multer = require('multer')
const {CloudinaryStorage} = require('multer-storage-cloudinary-v2')
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
  {
    effect: "improve",
    quality: "auto:best",
    fetch_format: "auto",
  },
],
    }
});

const upload = multer({
    storage,
    limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
},
    fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only JPG, PNG, and WebP images are allowed."));
  },
})

module.exports = upload;
