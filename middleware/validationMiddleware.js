const { validationResult, param } = require('express-validator');

// Runs after the express-validator rules in a route.
// If any rule failed, return 400 with the first error message.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// Reusable rule: ":id" in the URL must be a valid MongoDB ObjectId
const validateIdParam = [param('id').isMongoId().withMessage('Invalid id'), validate];

module.exports = { validate, validateIdParam };
