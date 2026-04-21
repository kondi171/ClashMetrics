require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, "../..", ".env") });

const express = require("express");
const exportRoutes = require("./routes/export.route");

const app = express();
const PORT = 3000;

app.use("/", exportRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});