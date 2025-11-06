import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";

// Verify required environment variables
const requiredEnvVars = ['DATABASE_URL', 'OPENWEATHER_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`WARNING: ${envVar} environment variable is not set`);
    // Don't throw here to allow the function to start, but log the warning
  }
}

// Initialize express app
const app = express();

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

// Register routes (ignore the server return value for serverless)
registerRoutes(app);

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

// Export the Express app as a serverless function
// Vercel will handle routing /api/* requests to this function
export default app;

