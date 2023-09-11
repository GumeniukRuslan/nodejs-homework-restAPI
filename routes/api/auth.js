const express = require("express");
const authCheck = require("../../middlewares/authCheck.js");
const AuthController = require("../../controllers/auth.js");

const router = express.Router();

router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

router.post("/logout", authCheck, AuthController.logout);

router.post("/logout", authCheck, AuthController.logout);

router.get("/current", authCheck, AuthController.currentCheck);

router.patch("/", authCheck, AuthController.updSubStatus);

module.exports = router;