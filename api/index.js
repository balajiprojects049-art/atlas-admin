/**
 * Vercel Serverless Function Entry Point
 * This wraps the Express app for serverless deployment
 */

const app = require('../server/server');

// Export the Express app as a serverless function
module.exports = app;
