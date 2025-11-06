// Vercel catch-all route for all /api/* requests
// This handles routes like /api/contact, /api/tasks, etc.
import app from "./_app";

// Vercel serverless function handler
// Export a handler function that wraps the Express app
export default function handler(req: any, res: any) {
  // Log the request for debugging
  console.log("Vercel handler called:", {
    method: req.method,
    url: req.url,
    path: req.path,
    originalUrl: req.originalUrl,
    query: req.query,
  });
  
  // Vercel might strip /api prefix, so ensure the path is correct
  // If the path doesn't start with /api, add it
  if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + req.url;
    req.path = "/api" + (req.path || req.url);
  }
  
  // Forward the request to Express
  // Express handles the response asynchronously
  app(req, res);
}
