import { z } from 'zod';

const fieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'email', 'textarea', 'checkbox']),
  required: z.boolean().optional().default(false),
});

export const createWidgetSchema = z.object({
  type: z.enum(['signup_form', 'cta_popover']),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
  fields: z.array(fieldSchema).default([]),
  button_text: z.string().max(100).optional(),
  display_options: z.record(z.any()).optional(),
});

export const updateWidgetSchema = createWidgetSchema.partial();
