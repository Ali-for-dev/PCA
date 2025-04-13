// backend/middlewares/multer.js

const multer = require('multer');
const path = require('path');


// Définir l'emplacement de stockage et le nom des fichiers
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

// Filtrer le type de fichier si besoin
function fileFilter(req, file, cb) {
  // Autoriser uniquement .jpg, .jpeg, .png
  const fileTypes = /jpeg|jpg|png/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'), false);
  }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  });
module.exports = upload;
