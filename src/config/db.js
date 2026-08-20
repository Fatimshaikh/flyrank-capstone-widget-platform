import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// A "pool" keeps a handful of DB connections open and reused,
// instead of opening/closing a new connection on every request.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Fired if a connection in the pool errors out unexpectedly
// (e.g. Postgres restarts). Without this, an unhandled error here
// would crash the whole Node process.
pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
});

export default pool;
