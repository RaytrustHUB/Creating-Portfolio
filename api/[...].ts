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
    // Track if we've resolved/rejected to prevent multiple calls
    let resolved = false;
    
    const finish = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };
    
    const error = (err: Error) => {
      if (!resolved) {
        resolved = true;
        console.error("Response error:", err);
        // Don't reject - resolve instead to prevent unhandled promise rejection
        resolve();
      }
    };
    
    // Handle response completion events
    res.once('finish', finish);
    res.once('close', finish);
    res.once('error', error);
    
    // Catch unhandled promise rejections in route handlers
    const unhandledRejection = (reason: any) => {
      console.error("Unhandled promise rejection in handler:", reason);
      if (!resolved && !res.headersSent) {
        resolved = true;
        res.status(500).json({
          error: "Internal server error",
          message: reason instanceof Error ? reason.message : String(reason)
        });
        resolve();
      }
    };
    
    // Set up unhandled rejection handler for this request
    process.once('unhandledRejection', unhandledRejection);
    
    // Clean up handler when request finishes
    res.once('finish', () => process.removeListener('unhandledRejection', unhandledRejection));
    res.once('close', () => process.removeListener('unhandledRejection', unhandledRejection));
    
    // Set a timeout to prevent hanging (30 seconds max)
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error("Request timeout after 30 seconds");
        if (!res.headersSent) {
          res.status(504).json({ 
            error: "Request timeout",
            message: "The request took too long to process"
          });
        }
        resolve(); // Resolve instead of reject to prevent unhandled promise rejection
      }
    }, 30000);
    
    try {
      // Call Express app - it's a callable function that handles (req, res)
      // The app will process the request and send a response
      app(req, res);
      
      // Clean up timeout when response finishes
      res.once('finish', () => clearTimeout(timeout));
      res.once('close', () => clearTimeout(timeout));
    } catch (error) {
      // Catch synchronous errors during handler execution
      clearTimeout(timeout);
      console.error("Handler error:", error);
      console.error("Error type:", error?.constructor?.name);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      
      // Make sure we always send a response
      if (!res.headersSent) {
        try {
          res.status(500).json({ 
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
          });
        } catch (sendError) {
          console.error("Failed to send error response:", sendError);
        }
      }
      
      // Clean up timeout
      res.once('finish', () => clearTimeout(timeout));
      res.once('close', () => clearTimeout(timeout));
      // Always resolve to prevent hanging
      finish();
    }
  });
}
