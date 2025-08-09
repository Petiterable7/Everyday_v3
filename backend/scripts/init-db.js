import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Add password column to users table if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password VARCHAR;
    `);
    
    // Make email NOT NULL if it isn't already
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN email SET NOT NULL;
    `);
    
    console.log('✅ Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
