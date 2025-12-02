import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';

export type RequestLike = Request | NextRequest;
export type ParamsLike = Record<string, string>;

const isProd = process.env.NODE_ENV === 'production';

export const buildErrorBody = (code: string, message: string, details?: unknown) =>
  isProd ? { error: { code, message } } : { error: { code, message, details } };

export const mapInfraError = (err: unknown) => {
  if (err instanceof SyntaxError) {
    return { code: 'BAD_JSON', message: 'Invalid JSON body', status: 400 };
  }
  if (err instanceof ZodError) {
    return { code: 'VALIDATION_ERROR', message: err.message, status: 400, details: err.errors };
  }

  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code?: string }).code;
    if (code === 'P2002') {
      return { code: 'UNIQUENESS_CONSTRAINT', message: 'Duplicate value not allowed', status: 409 };
    }
    if (code === 'P2003') {
      return { code: 'FK_CONSTRAINT', message: 'Related record not found', status: 409 };
    }
  }
  return null;
};

export const logContext = <Params = ParamsLike>(req: RequestLike, context?: { params?: Params }) => ({
  method: req.method,
  url: req.url,
  params: context?.params,
  userId: req.headers.get('x-user-id') ?? undefined,
});
