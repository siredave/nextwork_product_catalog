require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const {apiLimiter} = require("./middleware/rateLimiter");
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
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
//Middleware
app.use(apiLimiter);
app.use(express.json());
app.use(morgan("dev"));

//Health check route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "API is healthy" });
});


// Routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(multerErrorMiddleware);
app.use(errorHandler);

module.exports = app;
