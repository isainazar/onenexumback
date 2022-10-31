module.exports = async (req, res, next) => {
  const type = req.header("Accept");
  console.log(type);
  if (!type) {
    return res.status(403).json({
      status: 403,
      message: "Type not found",
    });
  }
  if (type !== "ADMIN") {
    return res.status(403).json({ message: "Do not have admin permissions" });
  }
  next();
};
