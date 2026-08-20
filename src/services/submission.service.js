import * as submissionRepo from '../repositories/submission.repository.js';
import * as widgetRepo from '../repositories/widget.repository.js';
import { enrichWithGeo } from './geo.service.js';
import { sendConfirmationEmail } from './notification.service.js';

export async function submitForm({ widgetId, data, website, ipAddress }) {
  const widget = await widgetRepo.findWidgetById(widgetId);
  if (!widget) {
    const err = new Error('Widget not found');
    err.status = 404;
    throw err;
  }

  // Honeypot check: real visitors never fill this hidden field, bots often do.
  // We still record it (honeypot_triggered = true) rather than silently vanishing,
  // so it's auditable, but we DON'T treat it as a normal successful lead.
  const honeypotTriggered = Boolean(website && website.trim().length > 0);

  // Geo enrichment - tries provider A, falls back to B, degrades gracefully to nulls.
  // We still run this even for honeypot hits, to keep timing consistent (avoids
  // giving bots an easy timing signal that they were caught).
  const geo = await enrichWithGeo(ipAddress);

  const submission = await submissionRepo.createSubmission({
    widgetId: widget.id,
    tenantId: widget.tenant_id,
    data,
    ipAddress,
    country: geo.country,
    city: geo.city,
    honeypotTriggered,
  });

  if (honeypotTriggered) {
    // Silently "succeed" from the bot's point of view, but don't send a real
    // confirmation email for a spam hit.
    return { submission, spam: true };
  }

  // Safe side effect: email failure must NEVER break the submission response.
  try {
    await sendConfirmationEmail(submission, widget);
  } catch (err) {
    console.error('[EMAIL] Failed to send confirmation (non-critical):', err.message);
  }

  return { submission, spam: false };
}
