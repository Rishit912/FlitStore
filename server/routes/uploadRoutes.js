const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, '../uploads/'); // Ensure this folder exists!
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
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

const upload = multer({ storage, fileFilter: function(req, file, cb) {
  checkFileTypes(file, cb);
}});

router.post('/', upload.single('image'), (req, res) => {
  // We want to store the path as /uploads/filename.png in the database
  const formattedPath = `/${req.file.path.replace(/\\/g, '/').replace('../', '')}`;
  
  res.send({
    message: 'Image uploaded successfully',
    image: formattedPath, 
  });
});

module.exports = router;