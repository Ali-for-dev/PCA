// backend/controllers/productController.js
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const cloudinary = require('../config/cloudinary');
// ==================================================
// 1) Ajouter ou mettre à jour un avis
//    Route: PUT /api/v1/review
// ==================================================
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
  
    if (!rating || !comment || !productId) {
      return next(new ErrorHandler('Missing fields (rating, comment, productId)', 400));
    }
  
    const review = {
      user: req.user._id,
      name: req.user.name,     // Le nom de l'utilisateur, stocké dans req.user
      rating: Number(rating),
      comment
    };
  
    // Récupération du produit
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }
  
    // Vérifier si l'utilisateur a déjà laissé un avis
    const isReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );
  
    if (isReviewed) {
      // Mettre à jour l'avis existant
      isReviewed.rating = review.rating;
      isReviewed.comment = review.comment;
    } else {
      // Ajouter un nouvel avis
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
  
    // Recalcul de la moyenne des ratings
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
      message: isReviewed ? 'Review updated' : 'Review added'
    });
  });

  // ==================================================
// 2) Récupérer tous les avis d'un produit
//    Route: GET /api/v1/reviews?id=<PRODUCT_ID>
// ==================================================
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const productId = req.query.id;
  
    if (!productId) {
      return next(new ErrorHandler('Product ID is required', 400));
    }
  
    const product = await Product.findById(productId);
  
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }
  
    res.status(200).json({
      success: true,
      reviews: product.reviews
    });
  });


  // ==================================================
// 3) Supprimer un avis
//    Route: DELETE /api/v1/reviews?id=<PRODUCT_ID>&reviewId=<REVIEW_ID>
// ==================================================
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const { id: productId, reviewId } = req.query;
  
    if (!productId || !reviewId) {
      return next(new ErrorHandler('productId and reviewId are required', 400));
    }
  
    const product = await Product.findById(productId);
  
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }
  
    // Filtrer pour enlever l'avis à supprimer
    const reviews = product.reviews.filter(
      rev => rev._id.toString() !== reviewId.toString()
    );
  
    // Vérifier si l'avis existait
    if (reviews.length === product.reviews.length) {
      return next(new ErrorHandler('Review not found or already removed', 404));
    }
  
    // Recalcul du nombre d'avis
    const numOfReviews = reviews.length;
  
    // Recalcul de la moyenne
    let ratings = 0;
    if (numOfReviews > 0) {
      ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;
    }
  
    // Mise à jour du produit
    await Product.findByIdAndUpdate(
      productId,
      {
        reviews,
        ratings,
        numOfReviews
      },
      {
        new: true,
        runValidators: false,
        useFindAndModify: false
      }
    );
  
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  });

// ----------------------------------------------
// Créer un nouveau produit (Admin) => POST /api/v1/admin/product/new
// ----------------------------------------------
// backend/controllers/productController.js

exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    brand,
    model,
    price,
    description,
    category,
    seller,
    stock
  } = req.body;

  req.body.user = req.user._id;

  let imagesArray = [];

  if (req.files) {
    for (const file of req.files) {
      // 1) Upload du fichier vers Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'products'
      });
      // 2) Push l'objet dans le tableau
      imagesArray.push({
        public_id: result.public_id,
        url: result.secure_url
      });
    }
  }

  req.body.images = imagesArray;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product
  });
});
/* 
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
    // 1) Récupérer le body normal (name, price, etc.)
    const {
      name,
      brand,
      model,
      price,
      description,
      category,
      seller,
      stock
    } = req.body;
  
    // 2) Si tu enregistres l'user qui a créé ce produit
    req.body.user = req.user._id;
  
    // 3) Gestion des images
    let imagesArray = [];
  
    if (req.files) {
      // Si des fichiers ont été uploadés
      req.files.forEach(file => {
        imagesArray.push({
          public_id: file.filename,          // En local, on peut mettre le nom du fichier
          url: `/uploads/${file.filename}`   // Chemin pour servir le fichier
        });
      });
    }
  
    req.body.images = imagesArray;
  
    // 4) Créer le produit
    const product = await Product.create(req.body);
  
    res.status(201).json({
      success: true,
      product
    });
  });
*/

// ----------------------------------------------
// Récupérer tous les produits => GET /api/v1/products
// Avec recherche, filtre, pagination
// ----------------------------------------------
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  // -- Déstructuration des query params pour recherche avancée --
  const { keyword, category, brand, minPrice, maxPrice, page, limit } = req.query;

  // -- Construire un objet de requête dynamique --
  let queryObj = {};

  // Recherche par nom (ou modèle)
  if (keyword) {
    queryObj.name = { $regex: keyword, $options: 'i' };
  }

  // Filtre par catégorie
  if (category) {
    queryObj.category = category;
  }

  // Filtre par marque
  if (brand) {
    queryObj.brand = { $regex: brand, $options: 'i' };
  }

  // Filtre par prix
  if (minPrice || maxPrice) {
    queryObj.price = {};
    if (minPrice) {
      queryObj.price.$gte = Number(minPrice);
    }
    if (maxPrice) {
      queryObj.price.$lte = Number(maxPrice);
    }
  }

  // -- Gestion de la pagination --
  // page par défaut = 1, limit par défaut = 8 (par exemple)
  const currentPage = Number(page) || 1;
  const perPage = Number(limit) || 8;
  const skip = (currentPage - 1) * perPage;

  // -- Exécuter la requête --
  const totalProducts = await Product.countDocuments(queryObj);
  const products = await Product.find(queryObj)
    .skip(skip)
    .limit(perPage);

  // Réponse
  res.status(200).json({
    success: true,
    totalProducts,
    count: products.length,
    currentPage,
    totalPages: Math.ceil(totalProducts / perPage),
    products
  });
});

// ----------------------------------------------
// Récupérer un seul produit => GET /api/v1/product/:id
// ----------------------------------------------
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product
  });
});

// ----------------------------------------------
// Mettre à jour un produit (Admin) => PUT /api/v1/admin/product/:id
// ----------------------------------------------
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Mettre à jour avec les données du body
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,            // retourne le document modifié
    runValidators: true,  // applique les validateurs du schema
    useFindAndModify: false
  });

  res.status(200).json({
    success: true,
    product
  });
});

// ----------------------------------------------
// Supprimer un produit (Admin) => DELETE /api/v1/admin/product/:id
// ----------------------------------------------
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product is deleted.'
  });
});
