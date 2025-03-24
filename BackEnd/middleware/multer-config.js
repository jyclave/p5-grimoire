const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage(); 

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Seules les images sont autorisées !'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter }).single('image'); 

const processImage = async (req, res, next) => {
  if (!req.file) return next(); 

  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`; 
  const outputPath = path.join('images', fileName);

  try {
    await sharp(req.file.buffer)
      .resize({ width: 500 }) 
      .webp({ quality: 80 }) 

    req.file.filename = fileName; 
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, processImage };