module.exports = async (req, res, next) => {
  if (req.session.user_type !== "ADMIN") {
    return res.status(403).json({ message: "Do not have admin permissions" });
  }
  next();
};
