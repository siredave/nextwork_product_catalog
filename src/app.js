require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const productRoutes = require("./routes/product.routes");
const multerErrorMiddleware = require("./middleware/multerErrorMiddleware");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  }),
);

// If the app is behind a proxy (e.g. Heroku, nginx), enable trust proxy
app.set("trust proxy", 1);

// Rate limiter configuration
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
    });
  },
});

app.use(apiLimiter);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "API is healthy" });
});

app.use("/api/v1/products", productRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(multerErrorMiddleware);
app.use(errorHandler);

module.exports = app;
