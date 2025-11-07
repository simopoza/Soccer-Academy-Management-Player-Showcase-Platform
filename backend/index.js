const express = require("express");
const dotenv = require("dotenv");
const db = require("./db.js");
const apiRoutes = require("./routes/apiRoutes.js");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors());
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

app.use("/api/v1", apiRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Soccer School API ⚽");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
