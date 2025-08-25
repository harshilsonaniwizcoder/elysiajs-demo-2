import { AppError } from '@/utils/errors';
import { ResponseBuilder } from '@/utils/response';
import { logger } from '@/utils/logger';
import { HTTP_STATUS } from '@/utils/constants';
import { t } from '@/localization';
import { ZodError } from 'zod';
import type { Context } from 'elysia';

type ErrorContext = Context & {
  error: Error;
  requestId: string;
};

const jsonResponse = (payload: unknown, status: number) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const appErrorResponse = (err: AppError, requestId: string) =>
  jsonResponse(
    ResponseBuilder.error(err.message, err.code, requestId),
    err.statusCode
  );

const zodErrorResponse = (err: ZodError, requestId: string) => {
  const message = err.errors.map(e => e.message).join(', ');
  return jsonResponse(
    ResponseBuilder.error(message, 'VALIDATION_ERROR', requestId),
    HTTP_STATUS.BAD_REQUEST
  );
};

const genericErrorResponse = (requestId: string) =>
  jsonResponse(
    ResponseBuilder.error(t('server.error'), 'INTERNAL_ERROR', requestId),
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );

export const errorHandler = ({ error, requestId }: ErrorContext) => {
  // If a plugin/route returned a Response directly, pass it through
  if (error instanceof Response) return error;

  logger.error('Error occurred:', {
    message: error?.message,
    stack: error?.stack,
    requestId,
  });

  if (error instanceof AppError) return appErrorResponse(error, requestId);
  if (error instanceof ZodError) return zodErrorResponse(error, requestId);
  return genericErrorResponse(requestId);
};