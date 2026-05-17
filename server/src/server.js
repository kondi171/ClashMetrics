require("dotenv").config();

const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../..", ".env") });

const express = require("express");

const cors = require("cors");

// Importy routerów

// const exportRoutes = require("./routes/export.route");

const dashboardRoutes = require("./routes/dashboard.route");

const app = express();

app.use(cors());

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

app.use("/api", dashboardRoutes);

// app.use("/api/export", exportRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.APP_DOMAIN}`);
});
