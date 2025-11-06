// Vercel catch-all route for all /api/* requests
// This handles routes like /api/contact, /api/tasks, etc.
import app from "./_app";

// Vercel serverless function handler
// Export a handler function that wraps the Express app
export default function handler(req: any, res: any) {
  // Wrap in try-catch to catch any synchronous errors
  try {
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
    // Wrap in try-catch to catch any errors during request handling
    try {
      app(req, res);
    } catch (expressError) {
      console.error("Express app error:", expressError);
      console.error("Error stack:", expressError instanceof Error ? expressError.stack : "No stack");
      if (!res.headersSent) {
        res.status(500).json({ 
          error: "Internal server error",
          message: expressError instanceof Error ? expressError.message : String(expressError)
        });
      }
    }
  } catch (error) {
    // Catch any synchronous errors during handler execution
    console.error("Handler initialization error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
