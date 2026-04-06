const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n  🏫 School ERP + LMS System`);
  console.log(`  ─────────────────────────`);
  console.log(`  ✅ Server running on http://localhost:${PORT}`);
  console.log(`  📚 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
