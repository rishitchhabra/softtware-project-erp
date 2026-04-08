const app = require('./app');

const PORT = process.env.PORT || 3000;

// Only listen when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`\n  🏫 School ERP + LMS System`);
    console.log(`  ─────────────────────────`);
    console.log(`  ✅ Server running on http://localhost:${PORT}`);
    console.log(`  📚 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

// Export for Vercel serverless
module.exports = app;
