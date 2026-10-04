// Allow only the given roles. Example: authorize('admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: you do not have permission for this action' });
    }
    next();
  };
};

// Used on "/user/:id" routes:
// a normal user can only view their own data, an admin can view anyone's data
const allowSelfOrAdmin = (req, res, next) => {
  const isSelf = req.params.id === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ message: "Forbidden: you can only access your own data" });
  }
  next();
};

module.exports = { authorize, allowSelfOrAdmin };
