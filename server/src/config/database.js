const { Pool } = require('pg');
require('dotenv').config();

// Replace YOUR_PASSWORD with your actual Supabase password
const connectionString = 'postgresql://postgres.qjkuijopnpwmvxwnorzr:%2FuL-LY%21XX%2A5RcmN@aws-1-us-east-2.pooler.supabase.com:5432/postgres';
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;