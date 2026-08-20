import { z } from 'zod';

export const submissionSchema = z.object({
  widget_id: z.number().int().positive(),
  data: z.record(z.string().max(2000)).refine(
    (obj) => Object.keys(obj).length <= 20,
    { message: 'Too many fields submitted' }
  ),
  website: z.string().max(500).optional(), // honeypot field - real users leave this empty
});
