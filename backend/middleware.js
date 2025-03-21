// Authentication middleware
const authenticate = (req, res, next) => {
  if (req.session && req.session.team) {
    next();
  } else {
    res.status(401).json({ error: 'Team not authenticated' });
  }
};

module.exports = { authenticate };
