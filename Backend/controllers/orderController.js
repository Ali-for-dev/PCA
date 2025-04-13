// backend/controllers/orderController.js

const Order = require('../models/Order');
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// ----------------------------------------------------------------------
// 1. Créer une nouvelle commande (COD) => POST /api/v1/order/new
// ----------------------------------------------------------------------
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;

  // Vérifier qu'il y a au moins un produit dans la commande
  if (!orderItems || orderItems.length === 0) {
    return next(new ErrorHandler('No order items', 400));
  }

  // Créer la commande
  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod: 'COD',    // Forcé à "Cash On Delivery"
    paymentStatus: 'Not Paid', 
    user: req.user._id       // L'utilisateur authentifié qui passe la commande
  });

  res.status(201).json({
    success: true,
    order
  });
});

// ----------------------------------------------------------------------
// 2. Récupérer une commande par ID => GET /api/v1/order/:id
//    Accessible à l'utilisateur propriétaire ou à l'admin
// ----------------------------------------------------------------------
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order
    .findById(req.params.id)
    .populate('user', 'name email')                // Récupère infos de l'utilisateur
    .populate('orderItems.product', 'name price'); // Récupère infos des produits

  if (!order) {
    return next(new ErrorHandler('No order found with this ID', 404));
  }

  // Vérifier si l'utilisateur est soit propriétaire de la commande, soit admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorHandler('Unauthorized to view this order', 403));
  }

  res.status(200).json({
    success: true,
    order
  });
});

// ----------------------------------------------------------------------
// 3. Récupérer toutes les commandes de l'utilisateur connecté => GET /api/v1/orders/me
// ----------------------------------------------------------------------
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders
  });
});

// ----------------------------------------------------------------------
// 4. Récupérer toutes les commandes (Admin) => GET /api/v1/admin/orders
// ----------------------------------------------------------------------
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach(order => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders
  });
});

// ----------------------------------------------------------------------
// 5. Mettre à jour une commande (Admin) => PUT /api/v1/admin/order/:id
//    Notamment pour changer le statut (Processing, Shipped, Delivered, etc.)
//    Et marquer la commande comme "Paid" lors de la livraison
// ----------------------------------------------------------------------
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  // Si la commande est déjà livrée, on ne peut plus la modifier
  if (order.orderStatus === 'Delivered') {
    return next(new ErrorHandler('This order has already been delivered', 400));
  }

  // Mise à jour du statut, par exemple "Processing" -> "Shipped" -> "Delivered"
  order.orderStatus = req.body.status;

  // On peut décrémenter le stock au statut "Shipped" ou bien au moment de la création
  // (selon ta logique).
  if (req.body.status === 'Shipped') {
    for (const item of order.orderItems) {
      await updateStock(item.product, item.quantity);
    }
  }

  // Si la commande est marquée "Delivered", on fixe la date de livraison
  // et on considère qu'elle est payée (puisque c'est du Cash On Delivery)
  if (req.body.status === 'Delivered') {
    order.deliveredAt = Date.now();
    order.paymentStatus = 'Paid';
    order.paidAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
    order
  });
});

// Petite fonction pour décrémenter le stock d'un produit
async function updateStock(productId, quantity) {
  const product = await Product.findById(productId);
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}

// ----------------------------------------------------------------------
// 6. Supprimer une commande (Admin) => DELETE /api/v1/admin/order/:id
// ----------------------------------------------------------------------
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
});
