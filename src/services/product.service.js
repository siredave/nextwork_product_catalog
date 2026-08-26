const mongoose = require("mongoose");
const Product = require("../models/product.model");
const cloudinary = require("../config/cloudinary");
const AppError = require("../middleware/appError");

// Create a new product document in MongoDB
const createProduct = async (data) => {
  const product = await Product.create(data);
  return product;
};

// Retrieve all products from the database
const getAllProducts = async (query = {}) => {
  const { category, sort, page = 1, limit = 10 } = query;

  // Validate and sanitize pagination parameters
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

  // Build filter object conditionally
  const filter = {};
  if (category && typeof category === "string") {
    filter.category = category.trim();
  }

  const allowedSortFields = new Set([
    "createdAt",
    "-createdAt",
    "price",
    "-price",
    "name",
    "-name",
    "category",
    "-category",
  ]);

  const sortOption = sort && typeof sort === "string" && allowedSortFields.has(sort)
    ? sort
    : "-createdAt";

  const skip = (pageNum - 1) * limitNum;

  // Run query and count in parallel for efficiency
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum),
  };
};

// Find a single product by its MongoDB ID
const getProductById = async (id) => {
  // Reject IDs that aren't valid MongoDB ObjectIds
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid product ID format", 400);
  }
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return product;
};

// Update a product and return the updated version
const updateProduct = async (id, data) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid product ID format", 400);
  }

  const existingProduct = await Product.findById(id);

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  if (
    data.imagePublicId &&
    existingProduct.imagePublicId &&
    existingProduct.imagePublicId !== data.imagePublicId
  ) {
    try {
      await cloudinary.uploader.destroy(existingProduct.imagePublicId);
    } catch (cloudinaryError) {
      console.warn(
        `Failed to remove old Cloudinary image ${existingProduct.imagePublicId}:`,
        cloudinaryError.message,
      );
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updatedProduct;
};

// Remove a product from the database
const deleteProduct = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid product ID format", 400);
  }
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Delete the image from Cloudinary if one exists, but do not block the DB delete
  if (product.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(product.imagePublicId);
    } catch (cloudinaryError) {
      console.warn(
        `Failed to remove Cloudinary image ${product.imagePublicId}:`,
        cloudinaryError.message,
      );
    }
  }

  return product;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
