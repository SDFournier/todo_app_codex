import { NextResponse, type NextRequest } from 'next/server';
import { mapDomainErrorToResponse } from './errorMapping';
import { logger } from '../../lib/logger';
import { buildErrorBody, logContext, mapInfraError, type ParamsLike, type RequestLike } from './errorUtils';

type Handler<Params = ParamsLike> = (req: RequestLike, context?: { params?: Params }) => Promise<Response>;

/**
 * Wraps a route handler with domain-error mapping and generic 500 fallback.
 */
export const withErrorHandling = <Params>(handler: Handler<Params>): Handler<Params> => {
  return async (req: RequestLike, context?: { params?: Params }) => {
    try {
      return await handler(req, context);
    } catch (err) {
      const mapped = mapDomainErrorToResponse(err);
      if (mapped) {
        return NextResponse.json(buildErrorBody(mapped.code, mapped.message), { status: mapped.status });
      }

      const infraMapped = mapInfraError(err);
      if (infraMapped) {
        return NextResponse.json(
          buildErrorBody(infraMapped.code, infraMapped.message, infraMapped.details),
          { status: infraMapped.status },
        );
      }

      logger.error('Unhandled error', { error: err as object, ...logContext<Params>(req, context) });
      return NextResponse.json(buildErrorBody('INTERNAL_ERROR', 'Unexpected error'), { status: 500 });
    }
  };
};
