require("dotenv").config() 
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api.js");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors('*'));
app.use(express.json());

// Main API routes
app.use("/api", apiRoutes);

// Simple health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running." });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please check if another process (like AirPlay on Mac) is using it.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
