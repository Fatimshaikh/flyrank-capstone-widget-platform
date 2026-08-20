import pool from '../config/db.js';

export async function createSubmission({ widgetId, tenantId, data, ipAddress, country, city, honeypotTriggered }) {
  const result = await pool.query(
    `INSERT INTO submissions (widget_id, tenant_id, data, ip_address, country, city, honeypot_triggered)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [widgetId, tenantId, JSON.stringify(data), ipAddress, country || null, city || null, honeypotTriggered || false]
  );
  return result.rows[0];
}

export async function findSubmissionsByTenant(tenantId, widgetId) {
  if (widgetId) {
    const result = await pool.query(
      'SELECT * FROM submissions WHERE tenant_id = $1 AND widget_id = $2 ORDER BY created_at DESC',
      [tenantId, widgetId]
    );
    return result.rows;
  }
  const result = await pool.query(
    'SELECT * FROM submissions WHERE tenant_id = $1 ORDER BY created_at DESC',
    [tenantId]
  );
  return result.rows;
}
