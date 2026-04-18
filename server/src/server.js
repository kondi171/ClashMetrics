const express = require("express");
const exportRoutes = require("./routes/export.route");

const app = express();
const PORT = 3000;

app.use("/", exportRoutes);

app.listen(PORT, () => {
  console.log(`Server działa: http://localhost:${PORT}`);
});