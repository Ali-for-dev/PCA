// backend/routes/order.routes.js
const express = require('express');
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// -------------------
// Routes utilisateur
// -------------------

// Créer une nouvelle commande (COD)
router.route('/order/new').post(isAuthenticatedUser, newOrder);

// Récupérer sa propre commande
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);

// Voir toutes ses commandes
router.route('/orders/me').get(isAuthenticatedUser, myOrders);

// -------------------
// Routes admin
// -------------------
router
  .route('/admin/orders')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);

router
  .route('/admin/order/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
