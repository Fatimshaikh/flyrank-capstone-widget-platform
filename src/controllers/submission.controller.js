import { submitForm } from '../services/submission.service.js';
import { submissionSchema } from '../validation/submission.schema.js';

export async function create(req, res) {
  const parsed = submissionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  }

  try {
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
    const { widget_id, data, website } = parsed.data;

    const { submission, spam } = await submitForm({ widgetId: widget_id, data, website, ipAddress });

    res.status(201).json({
      success: true,
      id: submission.id,
      spam, // included for transparency/testing - a real widget UI wouldn't show this to the bot
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
