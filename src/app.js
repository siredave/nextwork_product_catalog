require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const { apiLimiter } = require("./middleware/rateLimiter");
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const multerErrorMiddleware = require("./middleware/multerErrorMiddleware");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(helmet()); // 1) Adds security HTTP headers to protect the API.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  }),
); // 2) Allows requests from the frontend while controlling cross-origin access.
app.set("trust proxy", 1); // Trust the proxy (e.g. Heroku, nginx) for IP address resolution
app.use(apiLimiter); //Limits repeated requests to prevent abuse and brute-force attacks.
app.use(express.json()); // Parses incoming JSON request bodies for easier access to data.
app.use(express.urlencoded({ extended: true })); // Handles form-encoded request bodies from browser forms.
app.use(cookieParser()); // Parses cookies so refresh tokens or session data can be read.
app.use(compression()); // Compresses responses to reduce payload size and speed up transfer.
app.use(morgan("dev")); // Logs HTTP requests during development for easier debugging.

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
