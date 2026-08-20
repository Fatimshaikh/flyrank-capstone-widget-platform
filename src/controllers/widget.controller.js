import * as widgetService from '../services/widget.service.js';
import { createWidgetSchema, updateWidgetSchema } from '../validation/widget.schema.js';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

function withEmbedSnippet(widget) {
  return {
    ...widget,
    embed_snippet: `<script src="${API_BASE}/widget.v1.js?id=${widget.id}"></script>`,
  };
}

export async function create(req, res) {
  const parsed = createWidgetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  }
  try {
    const widget = await widgetService.createWidget(req.user.id, parsed.data);
    res.status(201).json(withEmbedSnippet(widget));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function list(req, res) {
  try {
    const widgets = await widgetService.listWidgets(req.user.id);
    res.json(widgets.map(withEmbedSnippet));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch widgets' });
  }
}

export async function getOne(req, res) {
  try {
    const widget = await widgetService.getWidget(req.params.id, req.user.id);
    res.json(withEmbedSnippet(widget));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function update(req, res) {
  const parsed = updateWidgetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  }
  try {
    const widget = await widgetService.updateWidget(req.params.id, req.user.id, parsed.data);
    res.json(withEmbedSnippet(widget));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function remove(req, res) {
  try {
    await widgetService.deleteWidget(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
