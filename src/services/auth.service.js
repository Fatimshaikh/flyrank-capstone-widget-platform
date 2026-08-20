import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../repositories/user.repository.js';

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '2h';

// Registers a new user - throws a plain Error with a .status if something is wrong,
// the controller layer decides how to turn that into an HTTP response
export async function registerUser(email, plainPassword) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.status = 409; // Conflict
    throw err;
  }

  const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  const user = await createUser(email, passwordHash);

  const token = signToken(user);
  return { user, token };
}

// Logs in an existing user
export async function loginUser(email, plainPassword) {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const passwordMatches = await bcrypt.compare(plainPassword, user.password_hash);
  if (!passwordMatches) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = signToken(user);
  // Strip password_hash before returning the user object anywhere
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

// Creates a signed JWT containing the user's id and email
function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}
