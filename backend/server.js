require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const leaveRoutes = require("./routes/leaves");
const assetRoutes = require("./routes/assets");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log every request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date(), message: "Server is running!" });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", authRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/leaves", leaveRoutes);
app.use("/api/v1/assets", assetRoutes);

// Keep old routes working too
app.use("/api/auth", authRoutes);
app.use("/api/user", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/assets", assetRoutes);

// Error Handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  logger.info(`Server running on port ${process.env.PORT}`);
  console.log(`Server running on port ${process.env.PORT}`);
});