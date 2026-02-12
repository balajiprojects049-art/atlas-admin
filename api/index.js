/**
 * Vercel Serverless Entry Point
 * 
 * This file wraps the Express app from server/app.js
 * and exports it for Vercel Serverless Functions.
 */
const app = require('../server/app.js');

// Vercel expects (req, res) handler or Express app
module.exports = app;
