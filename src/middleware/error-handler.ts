import { AppError } from '@/utils/errors';
import { ResponseBuilder } from '@/utils/response';
import { logger } from '@/utils/logger';
import { HTTP_STATUS } from '@/utils/constants';
import { t } from '@/localization';
import { ZodError } from 'zod';

const jsonResponse = (payload: unknown, status: number) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const appErrorResponse = (err: AppError) =>
  jsonResponse(ResponseBuilder.error(err.message, err.code), err.statusCode);

const zodErrorResponse = (err: ZodError) => {
  const message = err.errors.map(e => e.message).join(', ');
  return jsonResponse(
    ResponseBuilder.error(message, 'VALIDATION_ERROR'),
    HTTP_STATUS.BAD_REQUEST
  );
};

const genericErrorResponse = () =>
  jsonResponse(
    ResponseBuilder.error(t('server.error'), 'INTERNAL_ERROR'),
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );

export const errorHandler = (error: unknown) => {
  // If a plugin/route returned a Response directly, pass it through
  if (error instanceof Response) return error;

  const err = error as Error;
  logger.error('Error occurred:', { message: err?.message, stack: err?.stack });

  if (err instanceof AppError) return appErrorResponse(err);
  if (err instanceof ZodError) return zodErrorResponse(err);
  return genericErrorResponse();
};