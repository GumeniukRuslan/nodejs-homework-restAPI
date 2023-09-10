const express = require("express");
const authCheck = require("../../middlewares/authCheck.js");
const UserCheck = require("../../controllers/users.js");

const router = express.Router();

router.get("/", authCheck, UserCheck);

module.exports = router;