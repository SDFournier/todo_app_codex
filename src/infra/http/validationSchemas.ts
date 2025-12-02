import { z } from 'zod';

export const uuidString = z.string().uuid();
export const optionalUuid = uuidString.optional().nullable();
export const optionalShortText = z.string().max(191).optional();
export const optionalNotes = z.string().optional();
export const uuidArray = z.array(uuidString);
export const optionalUuidArray = uuidArray.optional();
export const positiveInt = z.number().int().positive();
export const optionalPositiveInt = positiveInt.optional();
export const optionalHexColor = z
  .string()
  .regex(/^#?[0-9a-fA-F]{3,8}$/, 'Color must be a hex value like #AABBCC')
  .max(20)
  .nullable()
  .optional();
