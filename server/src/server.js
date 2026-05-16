require("dotenv").config(); // Standardowe ładowanie dla Rendera i lokalnego środowiska
const path = require("path");
const express = require("express");
const cors = require("cors");

// Importy routerów
const dashboardRoutes = require("./routes/dashboard.route");

const app = express();

// Jeden, czysty CORS przepuszczający wszystko na czas testów
app.use(cors());
app.use(express.json());

// Logowanie zapytań – bardzo pomoże Ci w zakładce Logs na Renderze
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api", dashboardRoutes);

// Dynamiczny port: Render sam przypisze port, lokalnie użyje 3000
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.APP_DOMAIN || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`Server is running on ${DOMAIN}`);
});
