export interface ErrorResponse {
  success: false;
  message: string;
  correlationId: string;
  errors?: Record<string, string[]> | string[];
}

export const CRITICAL_ERROR_EVENT = 'critical.error';

export interface CriticalErrorPayload {
  message: string;
  statusCode: number;
  method: string;
  url: string;
  correlationId: string;
  error?: Error;
}
