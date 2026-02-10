const path = require('path');
const { Readable } = require('stream');
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function checkFileTypes(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/; // Add webp if you use it
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, cb) {
    checkFileTypes(file, cb);
  },
});

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No image provided' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'flitstore', resource_type: 'image' },
    (error, result) => {
      if (error) {
        return res.status(500).send({ message: 'Cloudinary upload failed' });
      }

      res.send({
        message: 'Image uploaded successfully',
        image: result.secure_url,
        publicId: result.public_id,
      });
    }
  );

  Readable.from(req.file.buffer).pipe(uploadStream);
});

module.exports = router;