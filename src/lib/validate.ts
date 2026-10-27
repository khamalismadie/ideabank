import { z } from 'zod'

// Idea schemas
export const IdeaStatusSchema = z.enum(['inbox', 'exploring', 'validated', 'archived'])

export const CreateIdeaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  content: z.string().max(10000).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  x: z.number().finite().optional(),
  y: z.number().finite().optional(),
  status: IdeaStatusSchema.default('inbox'),
})

export const UpdateIdeaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  content: z.string().max(10000).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  x: z.number().finite().optional(),
  y: z.number().finite().optional(),
  status: IdeaStatusSchema.optional(),
})

// Connection schemas
export const CreateConnectionSchema = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  relationship: z.enum(['parent', 'related', 'causes', 'inspires']).default('related'),
})

// Tag schemas
export const CreateTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default('#6366f1'),
})

export const UpdateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
})

// Query schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const IdeaFilterSchema = PaginationSchema.extend({
  search: z.string().optional(),
  tagId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Validation helper
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new ValidationError(result.error.errors)
  }
  return result.data
}

export class ValidationError extends Error {
  public errors: z.ZodError['errors']

  constructor(errors: z.ZodError['errors']) {
    super('Validation failed')
    this.name = 'ValidationError'
    this.errors = errors
  }
}
