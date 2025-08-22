import { randomUUID } from 'crypto';

export const requestIdMiddleware = (request: Request) => {
  const requestId = randomUUID();
  request.headers.set('x-request-id', requestId);
  return requestId;
};