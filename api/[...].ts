// Vercel catch-all route for all /api/* requests
// This handles routes like /api/contact, /api/tasks, etc.
import app from "./index";

// Export the Express app - Vercel will route all /api/* requests here
export default app;

