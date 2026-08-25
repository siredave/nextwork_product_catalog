const errorHandler = (err, req, res, next) => {
  // Use the error's status code, or default to 500
  const statusCode = err.statusCode || 500;
  // Only expose the message for operational errors
  const message = err.isOperational ? err.message : 'Internal server error';

  // Log the full stack trace in development for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;