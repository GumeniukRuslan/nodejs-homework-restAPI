const express = require("express");

const router = express.Router();

const authRoutes = require("./auth");
const contactsRoutes = require("./contacts");
const usersRoutes = require("./users");

router.use("/auth", authRoutes);
router.use("/contacts", contactsRoutes);
router.use("/users/current", usersRoutes);

module.exports = router;