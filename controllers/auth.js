const bcrypt = require("bcrypt");
const usersSchemas = require('../schemas/users');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const gravatar = require('gravatar');
const fs = require("node:fs/promises");
const path = require("node:path");
const Jimp = require("jimp");
const { v4: uuidv4 } = require('uuid');
const sendVerification = require("../helpers/sendVerification");

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
    const verificationToken = uuidv4();

    await User.create({ email, password: passwordHash, avatarURL: gravatar.url(email), verificationToken});

    await sendVerification({
      to: email,
      subject: 'Verification',
      html: `
        <p>To confirm your registration, please click on link below</p>
        <p>
          <a href="http://localhost:3000/users/verify/${verificationToken}">Click me</a>
        </p>
      `,
      text: `to confirm your account please click here http://localhost:3000/users/verify/${verificationToken}`
    })

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

    if (!user.verify) {
      return res.status(401).send({ message: "You have to verify your email" });
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

async function updAvatar(req, res, next) {
  try {
    const avatarPath= path.join(__dirname, "..", "public/avatars", req.file.filename)
    await fs.rename(req.file.path, avatarPath);
    const newURL = path.join('avatars', req.file.filename)

    const doc = await User.findByIdAndUpdate(req.user.id, { avatarURL: newURL }, { new: true }).exec();

    if (doc === null) {
      return res.status(404).send({ message: "User not found" });
    }

    const newAvatar = await Jimp.read(avatarPath);
    await newAvatar.resize(250, 250).writeAsync(avatarPath);
    
    return res.status(200).send({avatarURL: newURL});
  } catch (error) {
    next(error);
  }
}

async function verification(req, res, next) {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken }).exec();

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    }).exec();

    res.status(200).send({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
}

async function repeatVerification(req, res, next) {
  const { email } = req.body;

  if (!email) { 
    return res.status(400).send({ message: "missing required field email" });
  }

  try {
    const user = await User.findOne({ email }).exec();

    if (user.verify) {
      return res.status(400).send({ message: "Verification has already been passed" });
    }

    await sendVerification({
      to: email,
      subject: 'Verification (2)',
      html: `
        <p>To confirm your registration, please click on link below</p>
        <p>
          <a href="http://localhost:3000/users/verify/${user.verificationToken}">Click me</a>
        </p>
      `,
      text: `to confirm your account please click here http://localhost:3000/users/verify/${user.verificationToken}`
    })

    res.status(200).send({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  currentCheck, 
  updSubStatus,
  updAvatar,
  verification,
  repeatVerification
}