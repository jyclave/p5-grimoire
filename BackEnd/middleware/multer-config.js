
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configuration du stockage temporaire
const storage = multer.memoryStorage(); // Stockage temporaire en mémoire

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Seules les images sont autorisées !'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter }).single('image'); // Nom du champ d'image dans la requête

// Middleware pour traiter et optimiser l'image
const processImage = async (req, res, next) => {
  if (!req.file) return next(); // Pas d'image, on passe au prochain middleware

  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`; // Nom unique en format WebP
  const outputPath = path.join('images', fileName);

  try {
    await sharp(req.file.buffer)
      .resize({ width: 500 }) // Redimensionner en largeur fixe, hauteur ajustée proportionnellement
      .webp({ quality: 80 }) // Conversion en WebP avec qualité optimisée
      .toFile(outputPath);

    req.file.filename = fileName; // Mise à jour du nom du fichier pour le contrôleur
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, processImage };
