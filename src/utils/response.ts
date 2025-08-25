import type { ApiResponse, PaginatedResponse } from '@/types/global';
import { randomUUID } from 'crypto';
import { HTTP_STATUS } from '@/utils/constants';

export class ResponseBuilder {
  static success<T>(
    message: string,
    data?: T,
    requestId: string = randomUUID()
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: Date.now(),
    } as unknown as ApiResponse<T>;
  }

  static error(
    message: string,
    error?: string,
    requestId: string = randomUUID()
  ): ApiResponse {
    return {
      success: false,
      message,
      data: null,
      timestamp: Date.now(),
    } as unknown as ApiResponse;
  }

  static paginated<T>(
    message: string,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    requestId: string = randomUUID()
  ): PaginatedResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
      timestamp: Date.now(),
    } as unknown as PaginatedResponse<T>;
  }
}

export const jsonResponse = (
  payload: unknown,
  status: number = HTTP_STATUS.OK
) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });