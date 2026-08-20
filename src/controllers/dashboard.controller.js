import * as dashboardRepo from '../repositories/dashboard.repository.js';
import * as submissionRepo from '../repositories/submission.repository.js';

export async function getStats(req, res) {
  try {
    const stats = await dashboardRepo.getSubmissionStats(req.user.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
}

export async function getSubmissions(req, res) {
  try {
    const widgetId = req.query.widget_id ? Number(req.query.widget_id) : undefined;
    const submissions = await submissionRepo.findSubmissionsByTenant(req.user.id, widgetId);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load submissions' });
  }
}
