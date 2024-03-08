const express = require("express");
const { login } = require("../controller/user.controller");

const userRoutes = express.Router();

userRoutes.post("/login", login);

module.exports = userRoutes;
