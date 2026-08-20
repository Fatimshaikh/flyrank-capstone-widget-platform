import { registerUser, loginUser } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validation/auth.schema.js';

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
    });
  }

  try {
    const { email, password } = parsed.data;
    const { user, token } = await registerUser(email, password);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
    });
  }

  try {
    const { email, password } = parsed.data;
    const { user, token } = await loginUser(email, password);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
