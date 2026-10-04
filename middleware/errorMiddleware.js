// 404 handler for routes that do not exist
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Central error handler.
// Express 5 automatically sends errors from async controllers here.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Server error';

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid id';
  }

  // Mongoose schema validation failed
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)[0].message;
  }

  // Duplicate unique field (e.g. email)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate value: this record already exists';
  }

  // Invalid JSON in request body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({ message });
};

module.exports = { notFound, errorHandler };
