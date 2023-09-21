const express = require("express");
const authCheck = require("../../middlewares/authCheck.js");
const AuthController = require("../../controllers/auth.js");
const downloadAvatar = require("../../middlewares/downloadAvatar.js");

const router = express.Router();

router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

router.post("/logout", authCheck, AuthController.logout);

router.post("/logout", authCheck, AuthController.logout);

router.get("/current", authCheck, AuthController.currentCheck);

router.patch("/", authCheck, AuthController.updSubStatus);

router.patch("/avatars", [authCheck, downloadAvatar.single("avatar")], AuthController.updAvatar);

router.get("/verify/:verificationToken", AuthController.verification);

router.post("/verify", AuthController.repeatVerification);

module.exports = router;