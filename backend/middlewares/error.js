const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose validation errors (if you're using MongoDB)
  if (err.name === "ValidationError") {
    statusCode = 400; // Bad Request
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  // Handle duplicate key errors (MongoDB)
  if (err.code === 11000) {
    statusCode = 409; // Conflict
    message = "Duplicate field value entered";
  }

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;