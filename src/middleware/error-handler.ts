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

export const errorHandler = (error: Error) => {
  logger.error('Error occurred:', { message: error.message, stack: error.stack });

  if (error instanceof AppError) return appErrorResponse(error);
  if (error instanceof ZodError) return zodErrorResponse(error);
  return genericErrorResponse();
};