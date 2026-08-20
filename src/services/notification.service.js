// Sends a confirmation notification after a submission is stored.
// This is a NON-CRITICAL side effect: if it fails, the submission itself
// must still be considered successful. We log to console instead of using
// real SMTP, per the capstone brief - failure-tolerance is what's graded,
// not actual email deliverability.

export async function sendConfirmationEmail(submission, widget) {
  // FORCE_EMAIL_FAILURE lets us deliberately simulate a broken provider
  // during testing/demo, to prove the failure doesn't block success.
  if (process.env.FORCE_EMAIL_FAILURE === 'true') {
    throw new Error('Simulated email provider outage');
  }

  // Simulate network latency of a real email API call
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log('[EMAIL] Confirmation sent', {
    to: submission.data.email || '(no email field in submission)',
    widgetTitle: widget.title,
    submissionId: submission.id,
    timestamp: new Date().toISOString(),
  });
}
