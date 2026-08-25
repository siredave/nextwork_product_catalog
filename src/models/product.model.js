const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [3, "Name must be at least 3 characters long"],
      maxLength: [100, "Name cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxLength: [500, "Description cannot exceed 500 characters"],
    },
    imageUrl:{
      type: String,
      default: null
    },
      imagePublicId: {
    type: String,
    default: null
  },
    createdAt: { type: Date, default: Date.now },
  },
  
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
