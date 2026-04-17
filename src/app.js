const express = require("express");

const warRoutes = require("./routes/war.routes");

const app = express();

app.use(express.json());

app.use("/api/war", warRoutes);

module.exports = app;