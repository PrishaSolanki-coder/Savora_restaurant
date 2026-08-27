// Vercel serverless entry point.
// Vercel treats any file under /api as its own serverless function.
// We just hand it our existing, fully-configured Express app — server.js
// already skips app.listen() when process.env.VERCEL === '1', which
// Vercel sets automatically in its build/runtime environment.
module.exports = require('../server');
