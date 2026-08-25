const multer = require("multer");

const multerErrorMiddleware = (err, req, res, next) => {
  // Pass non-Multer errors to the next error handler
  if (!(err instanceof multer.MulterError)) {
    return next(err);
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Image size must not exceed 5 MB.",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Unexpected file field.",
    });
  }

  return res.status(400).json({
    success: false,
    message: err.message,
  });
};

module.exports = multerErrorMiddleware;