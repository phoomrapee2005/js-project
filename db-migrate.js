import { getConnection } from './src/lib/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function main() {
  const connection = await getConnection();
  try {
    console.log('Adding session_id to orders table...');
    await connection.execute('ALTER TABLE orders ADD COLUMN session_id VARCHAR(255) AFTER id');
    console.log('Successfully added session_id column!');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column session_id already exists.');
    } else {
      console.error('Error altering table:', err);
    }
  } finally {
    await connection.end();
    process.exit(0);
  }
}

main();
