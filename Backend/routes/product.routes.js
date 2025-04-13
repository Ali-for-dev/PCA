// backend/routes/product.routes.js
const express = require('express');
const router = express.Router();

const {
  getProducts,
  newProduct,
  getSingleProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

// ----------------------------------------------
// Routes publiques
// ----------------------------------------------
router.route('/products').get(getProducts);            // GET tous les produits
router.route('/product/:id').get(getSingleProduct);    // GET un produit par ID

// ----------------------------------------------
// Routes protégées - Admin seulement
// ----------------------------------------------
router
  .route('/admin/product/new')
  .post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

router
  .route('/admin/product/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);


// --- Routes Reviews ---
// Ajouter / Mettre à jour un avis
router.route('/review')
.put(isAuthenticatedUser, createProductReview);

// Récupérer tous les avis d'un produit
router.route('/reviews')
.get(getProductReviews);

// Supprimer un avis
router.route('/reviews')
.delete(isAuthenticatedUser, deleteReview);


// Route d'exemple : on autorise l'admin à créer un produit
// upload.array('images', 5) => on attend un champ "images" pouvant contenir jusqu'à 5 fichiers
router.post(
    '/admin/product/new',
    isAuthenticatedUser,
    authorizeRoles('admin'),
    upload.array('images', 5), // on accepte jusqu'à 5 fichiers
    newProduct
  );
module.exports = router;
