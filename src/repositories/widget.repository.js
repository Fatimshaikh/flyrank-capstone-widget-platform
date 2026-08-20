import pool from '../config/db.js';

// Every query here is scoped to tenant_id - this IS tenant isolation.

export async function createWidget(tenantId, data) {
  const { type, title, description, fields, button_text, display_options } = data;
  const result = await pool.query(
    `INSERT INTO widgets (tenant_id, type, title, description, fields, button_text, display_options)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [tenantId, type, title, description || null, JSON.stringify(fields || []), button_text || 'Submit', JSON.stringify(display_options || {})]
  );
  return result.rows[0];
}

export async function findWidgetsByTenant(tenantId) {
  const result = await pool.query(
    'SELECT * FROM widgets WHERE tenant_id = $1 ORDER BY created_at DESC',
    [tenantId]
  );
  return result.rows;
}

// Used by the OWNER-facing routes - scoped to tenant, so tenant B can never fetch tenant A's widget
export async function findWidgetByIdAndTenant(id, tenantId) {
  const result = await pool.query(
    'SELECT * FROM widgets WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  return result.rows[0] || null;
}

// Used by PUBLIC routes (config delivery, submissions) - no tenant check,
// because a visitor on the customer's site doesn't have a tenant JWT at all
export async function findWidgetById(id) {
  const result = await pool.query('SELECT * FROM widgets WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function updateWidget(id, tenantId, data) {
  const { type, title, description, fields, button_text, display_options } = data;
  const result = await pool.query(
    `UPDATE widgets
     SET type = COALESCE($1, type),
         title = COALESCE($2, title),
         description = COALESCE($3, description),
         fields = COALESCE($4, fields),
         button_text = COALESCE($5, button_text),
         display_options = COALESCE($6, display_options),
         updated_at = NOW()
     WHERE id = $7 AND tenant_id = $8
     RETURNING *`,
    [type, title, description, fields ? JSON.stringify(fields) : null, button_text, display_options ? JSON.stringify(display_options) : null, id, tenantId]
  );
  return result.rows[0] || null;
}

export async function deleteWidget(id, tenantId) {
  const result = await pool.query(
    'DELETE FROM widgets WHERE id = $1 AND tenant_id = $2 RETURNING id',
    [id, tenantId]
  );
  return result.rows[0] || null;
}
