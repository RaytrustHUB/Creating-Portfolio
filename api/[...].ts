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
  
  // Wrap Express app call in a Promise to handle async operations
  // Express apps are callable functions that handle (req, res)
  return new Promise<void>((resolve, reject) => {
    // Handle response completion events
    res.on('finish', () => resolve());
    res.on('close', () => resolve());
    res.on('error', (err: Error) => reject(err));
    
    try {
      // Call Express app - it's a callable function that handles (req, res)
      // The app will process the request and send a response
      app(req, res);
    } catch (error) {
      // Catch synchronous errors during handler execution
      console.error("Handler error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      if (!res.headersSent) {
        res.status(500).json({ 
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error)
        });
      }
      reject(error);
    }
  });
}
