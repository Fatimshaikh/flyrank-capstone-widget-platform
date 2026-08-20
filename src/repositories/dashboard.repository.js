import pool from '../config/db.js';

export async function getSubmissionStats(tenantId) {
  const totalResult = await pool.query(
    'SELECT COUNT(*)::int AS total FROM submissions WHERE tenant_id = $1 AND honeypot_triggered = false',
    [tenantId]
  );

  const byWidgetResult = await pool.query(
    `SELECT w.id AS widget_id, w.title, COUNT(s.id)::int AS submission_count
     FROM widgets w
     LEFT JOIN submissions s ON s.widget_id = w.id AND s.honeypot_triggered = false
     WHERE w.tenant_id = $1
     GROUP BY w.id, w.title
     ORDER BY submission_count DESC`,
    [tenantId]
  );

  const byCountryResult = await pool.query(
    `SELECT COALESCE(country, 'Unknown') AS country, COUNT(*)::int AS count
     FROM submissions
     WHERE tenant_id = $1 AND honeypot_triggered = false
     GROUP BY country
     ORDER BY count DESC`,
    [tenantId]
  );

  const last7DaysResult = await pool.query(
    `SELECT DATE(created_at) AS date, COUNT(*)::int AS count
     FROM submissions
     WHERE tenant_id = $1 AND honeypot_triggered = false AND created_at >= NOW() - INTERVAL '7 days'
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [tenantId]
  );

  return {
    total_submissions: totalResult.rows[0].total,
    by_widget: byWidgetResult.rows,
    by_country: byCountryResult.rows,
    last_7_days: last7DaysResult.rows,
  };
}
