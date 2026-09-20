import { StandardResponse, ErrorResponse } from "@/types/auth.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  code: string;
  details?: Record<string, unknown>;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers = {}, ...rest } = options;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    (requestHeaders as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || (json && json.success === false)) {
    const errorPayload: ErrorResponse = json || {
      success: false,
      error: {
        code: "HTTP_ERROR",
        message: response.statusText || "Request failed",
      },
    };

    throw new ApiError(
      errorPayload.error.code,
      errorPayload.error.message,
      response.status,
      errorPayload.error.details
    );
  }

  const standardRes = json as StandardResponse<T>;
  return standardRes.data;
}
