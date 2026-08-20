import * as widgetRepo from '../repositories/widget.repository.js';

export async function createWidget(tenantId, data) {
  return widgetRepo.createWidget(tenantId, data);
}

export async function listWidgets(tenantId) {
  return widgetRepo.findWidgetsByTenant(tenantId);
}

export async function getWidget(id, tenantId) {
  const widget = await widgetRepo.findWidgetByIdAndTenant(id, tenantId);
  if (!widget) {
    const err = new Error('Widget not found');
    err.status = 404;
    throw err;
  }
  return widget;
}

export async function updateWidget(id, tenantId, data) {
  const widget = await widgetRepo.updateWidget(id, tenantId, data);
  if (!widget) {
    const err = new Error('Widget not found');
    err.status = 404;
    throw err;
  }
  return widget;
}

export async function deleteWidget(id, tenantId) {
  const deleted = await widgetRepo.deleteWidget(id, tenantId);
  if (!deleted) {
    const err = new Error('Widget not found');
    err.status = 404;
    throw err;
  }
  return deleted;
}
