// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    maxLength: [100, 'Product name cannot exceed 100 characters']
  },
  brand: {
    type: String,
    required: [true, 'Please enter the brand of the product']
  },
  model: {
    type: String,
    required: [true, 'Please enter the model of the product']
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    maxLength: [7, 'Product price cannot exceed 7 characters'],
    default: 0.0
  },
  description: {
    type: String,
    required: [true, 'Please enter product description']
  },
  ratings: {
    type: Number,
    default: 0
  },
  images: [
    {
      public_id: {
        type: String,
        required: false
      },
      url: {
        type: String,
        required: false
      }
    }
  ],
  // Tu peux adapter les valeurs de catégorie à ce que tu vends vraiment
  category: {
    type: String,
    required: [true, 'Please select category for this product'],
    enum: {
      values: [
        'Processors',
        'Graphics Cards',
        'Motherboards',
        'Memory (RAM)',
        'Storage (HDD/SSD)',
        'Power Supplies',
        'Cases',
        'Cooling',
        'Keyboards',
        'Mice',
        'Monitors',
        'Laptop',
        'Networking',
        'Accessories',
        'Others'
      ],
      message: 'Please select correct category for product'
    }
  },
  // Si tu vends toi-même le produit, tu peux renommer "seller" en "manufacturer" 
  // ou le conserver si tu souhaites différencier différents vendeurs
  seller: {
    type: String,
    required: [true, 'Please enter product seller']
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    default: 0
  },
  specs: {
    // Tu peux stocker ici des informations spécifiques (exemple : fréquence, mémoire, connectiques, etc.)
    type: Object,
    default: {}
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],
  user: {
    // L'utilisateur qui a créé ce produit (ou qui le gère)
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);