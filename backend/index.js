const express = require("express");
const dotenv = require("dotenv");
const db = require("./db.js");
const ensureIndexes = require("./config/indexes.js");
const apiRoutes = require("./routes/apiRoutes.js");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// -------------------------------
// CORS & Cookie Parser
// -------------------------------
const corsOptions = {
  origin: "http://localhost:5173", // your frontend
  credentials: true,              // allow cookies to be sent
};
app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json());

// Catch invalid JSON before routes
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: "Invalid JSON format" });
  }
  next();
});

app.use((req, res, next) => {
  console.log("CORS DEBUG:", req.method, req.url, req.headers.origin);
  next();
});


// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Soccer School API",
      version: "1.0.0",
      description: "API for managing soccer school players, teams, matches, and stats",
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
        description: "Local development server",
      },
    ],
  },
  apis: ["./routes/*.js"], // files where Swagger comments are written
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// app.use("/api/v1", () => {
//   console.log("API v1 route accessed");
//   apiRoutes;
// });

app.use("/api/v1", (req, res, next) => {
  console.log("API v1 route accessed:", req.method, req.url);
  next();
}, apiRoutes);


app.get("/", (req, res) => {
  res.send("Welcome to Soccer School API ⚽");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// **Export app before listen**
module.exports = app;


// Only listen if this file is run directly
if (require.main === module) {
  // ==========================================
  // 🔥 RUN INDEXES BEFORE SERVER STARTS
  // ==========================================
  ensureIndexes();
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}
