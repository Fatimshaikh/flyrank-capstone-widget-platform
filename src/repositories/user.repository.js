import pool from '../config/db.js';

// Find a user by email - used during login, and to check for duplicates during register
export async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

// Find a user by id - used when verifying a JWT and loading the current user
export async function findUserById(id) {
  const result = await pool.query(
    'SELECT id, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Create a new user - password_hash must already be hashed by the service layer,
// this repository never sees or handles a plain-text password
export async function createUser(email, passwordHash) {
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, passwordHash]
  );
  return result.rows[0];
}
