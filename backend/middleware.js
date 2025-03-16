// Authentication middleware
const authenticate = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'User not authenticated' });
  }
};

module.exports = { authenticate };
