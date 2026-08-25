const mongoose = require('mongoose');
const Product = require('../models/product.model');
const cloudinary = require('../config/cloudinary');
const AppError = require('../middleware/appError')


// Create a new product document in MongoDB
const createProduct = async (data) => {
  const product = await Product.create(data);
  return product;
};

// Retrieve all products from the database
const getAllProducts = async () => {
  const products = await Product.find();
  return products;
};

// Find a single product by its MongoDB ID
const getProductById = async (id) => {
 // Reject IDs that aren't valid MongoDB ObjectIds
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid product ID format', 400);
  }
  const product = await Product.findById(id);

  if(!product){
    throw new AppError('Product not found', 404)
  }
  return product;
};

// Update a product and return the updated version
const updateProduct = async (id, data) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid product ID format', 400);
  }

  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

// Remove a product from the database
const deleteProduct = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid product ID format', 400);
  }
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  // Delete the image from Cloudinary if one exists
  if (product.imagePublicId) {
    await cloudinary.uploader.destroy(product.imagePublicId);
  }
  return product;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};