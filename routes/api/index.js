const express = require("express");

const router = express.Router();

const authRoutes = require("./auth");
const contactsRoutes = require("./contacts");

router.use("/users", authRoutes);
router.use("/api/contacts", contactsRoutes);


module.exports = router;