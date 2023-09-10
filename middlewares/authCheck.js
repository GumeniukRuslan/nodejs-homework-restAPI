const User = require('../models/user');
const jwt = require("jsonwebtoken");

async function authCheck(req, res, next) {
  const authHeader = req.headers.authorization || "";

  const [bearer, token] = authHeader.split(" ");

  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Not authorized" });
  }
  try {
    const {id} = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
        return res.status(401).send({ message: "Not authorized" });
    };
    req.user = user;
      next();
    } catch (e) {
        next(e)
    }
  };


module.exports = authCheck;