const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseUrl.startsWith('http') && supabaseServiceKey && supabaseServiceKey !== 'your_supabase_service_role_key_here';

let supabaseAdmin;

if (isConfigured) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  console.log('  ✅ Supabase connected');
} else {
  console.log('  ⚠️  Supabase not configured — using mock mode with demo data');
  console.log('     Credentials: admin/admin123, fac001/pass123, stu001/pass123');

  // Use in-memory mock database with seeded data
  const { mockClient } = require('./mockdb');
  supabaseAdmin = mockClient;
}

module.exports = { supabaseAdmin, isConfigured };
