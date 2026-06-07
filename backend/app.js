require("dotenv").config(); // load env variables
const express = require("express"); // Express framework
const cors = require("cors"); // CORS middleware
const organizeRouter = require("./routes/app.route");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger 
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

//  Route
app.use("/api", organizeRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    useMock: process.env.USE_MOCK === "true" || !process.env.GEMINI_API_KEY,
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(` Backend running at http://localhost:${PORT}`);
  console.log(
    ` Gemini key: ${process.env.GEMINI_API_KEY ? "loaded" : "not found → using mock"}`,
  );
  console.log(` Mock mode: ${process.env.USE_MOCK === "true" ? "ON" : "OFF"}`);
});
