// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'algeria',
    },
  },
  user: {
    // L’utilisateur qui passe la commande
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      },
      image: {
        type: String,
        required: false
      },
      price: {
        type: Number,
        required: true
      },
      // Pour relier à ton Product
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
      }
    }
  ],
  paymentMethod: {
    type: String,
    default: 'COD', // Par défaut on considère que c'est du "Cash On Delivery"
  },
  paymentStatus: {
    type: String,
    default: 'Not Paid', 
    // Tu peux utiliser "Paid" / "Not Paid" ou "Pending" / "Completed" selon ta logique
  },
  paidAt: {
    type: Date
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  orderStatus: {
    type: String,
    required: true,
    default: 'Processing'
  },
  deliveredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
