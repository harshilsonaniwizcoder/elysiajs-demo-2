import { describe, it, expect } from 'bun:test';
import { ResponseBuilder } from '@/utils/response';

describe('ResponseBuilder', () => {
  it('should create success response', () => {
    const response = ResponseBuilder.success('Success message', { id: 1 });
    
    expect(response.success).toBe(true);
    expect(response.message).toBe('Success message');
    expect(response.data).toEqual({ id: 1 });
    expect(response.timestamp).toBeDefined();
    expect(response.requestId).toBeDefined();
  });

  it('should create error response', () => {
    const response = ResponseBuilder.error('Error message', 'ERROR_CODE');
    
    expect(response.success).toBe(false);
    expect(response.message).toBe('Error message');
    expect(response.error).toBe('ERROR_CODE');
    expect(response.timestamp).toBeDefined();
    expect(response.requestId).toBeDefined();
  });

  it('should create paginated response', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const pagination = { page: 1, limit: 10, total: 20 };
    
    const response = ResponseBuilder.paginated('Success', data, pagination);
    
    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.pagination.totalPages).toBe(2);
  });
});