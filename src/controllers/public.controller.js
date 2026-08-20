import * as widgetRepo from '../repositories/widget.repository.js';

// Public, cached config endpoint - anyone can call this, no auth.
// Short cache because a widget owner might update the widget and expect it to reflect soon.
export async function getWidgetConfig(req, res) {
  try {
    const widget = await widgetRepo.findWidgetById(req.params.id);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    res.set('Cache-Control', 'public, max-age=60'); // cache 60s
    res.json({
      id: widget.id,
      type: widget.type,
      title: widget.title,
      description: widget.description,
      fields: widget.fields,
      button_text: widget.button_text,
      display_options: widget.display_options,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load widget config' });
  }
}
