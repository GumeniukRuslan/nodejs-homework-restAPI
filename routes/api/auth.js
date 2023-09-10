const express = require("express");
const authCheck = require("../../middlewares/authCheck.js");
const AuthController = require("../../controllers/auth.js");

const router = express.Router();

router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

router.post("/logout", authCheck, AuthController.logout);

router.post("/logout", authCheck, AuthController.logout);

module.exports = router;