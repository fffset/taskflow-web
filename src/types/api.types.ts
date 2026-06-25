export interface ApiError {
  statusCode: number;
  errorCode: string;
  message: string;
  path: string;
  method: string;
  timestamp: string;
}