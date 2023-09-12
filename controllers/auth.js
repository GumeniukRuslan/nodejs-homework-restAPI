const bcrypt = require("bcrypt");
const usersSchemas = require('../schemas/users');
const User = require('../models/user');
const jwt = require("jsonwebtoken");

async function register(req, res, next) {
  const { email, password } = req.body;
  const { error } = usersSchemas.usersSchema.validate(req.body)
  if (error) {
    if (error.details[0].type === "any.required") {
      return res.status(400).send({ message: `missing required ${error.details[0].path[0]} field` });
    }
    return res.status(400).send({ message: error.details[0].message});
  }
  try {
    const user = await User.findOne({ email }).exec();

    if (user) {
      return res.status(409).send({ message: "Email in use" });
    }
    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({ email, password: passwordHash });

    res.status(201).json({ user: {email, password} });

  } catch (e) {
    next(e);
  }
};

async function login (req, res, next) {
  const { email, password } = req.body;
  const { error } = usersSchemas.usersSchema.validate(req.body)
  if (error) {
    if (error.details[0].type === "any.required") {
      return res.status(400).send({ message: `missing required ${error.details[0].path[0]} field` });
    }
    return res.status(400).send({ message: error.details[0].message});
  }
  try {
    const user = await User.findOne({ email }).exec();

    if (!user) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    const isMatch = await bcrypt.compare(password, user.password); 
    if (!isMatch) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    await User.findByIdAndUpdate(user._id, { token }).exec();

    res.status(200).send({ token, user: {email: user.email, subscription: user.subscription } });
    
  } catch (e) {
    next(e);
  }
};

async function logout(req, res, next) {
  const { _id } = req.user;
  const user = await User.findByIdAndUpdate(_id, { token: "" })
  if (!user) {
    return res.status(401).send({ message: "Not authorized" });
  }
  res.status(204).send()
}

function currentCheck(req, res, next) {
  const { email, subscription } = req.user;
  
  res.status(200).json({email, subscription});
};

async function updSubStatus(req, res, next) {
  const { error } = usersSchemas.subUpdSchema.validate(req.body)

  if (!Object.keys(req.body).length) { 
    return res.status(400).send({ message: `missing field subscription` });
  }
  if (error) {
    return res.status(400).send({ message: error.details[0].message});
  }
  
  const doc = await User.findOneAndUpdate({email: req.user.email}, req.body, { new: true }).exec();

  return res.status(200).send(doc);
}

module.exports = {
  register,
  login,
  logout,
  currentCheck, 
  updSubStatus
}