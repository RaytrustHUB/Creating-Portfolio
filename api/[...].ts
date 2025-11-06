// Vercel catch-all route for all /api/* requests
// This handles routes like /api/contact, /api/tasks, etc.
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";

// Verify required environment variables
const requiredEnvVars = ['DATABASE_URL', 'OPENWEATHER_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`WARNING: ${envVar} environment variable is not set`);
  }
}

// Initialize express app
const app = express();

// CORS middleware for serverless functions
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Test endpoint to verify API is working
app.get("/api/test", (_req, res) => {
  res.json({ 
    status: "ok", 
    message: "API is working",
    timestamp: new Date().toISOString(),
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });
});

// Register routes (ignore the server return value for serverless)
registerRoutes(app);

// Catch-all route for debugging - should not be reached if routes are registered correctly
app.use("/api/*", (req, res) => {
  console.log("Unhandled API route:", req.method, req.path);
  res.status(404).json({ 
    error: "Route not found",
    method: req.method,
    path: req.path
  });
});

// Global error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`Error ${status}: ${message}`);
  
  if (!res.headersSent) {
    res.status(status).json({ 
      error: message,
      status,
      timestamp: new Date().toISOString()
    });
  }
});

// Vercel serverless function handler
export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
