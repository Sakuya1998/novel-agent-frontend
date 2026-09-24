import type { operations, paths } from "./generated/schema";
import { operationDefinitions } from "./generated/operations";

export type ApiPaths = paths;
export type ApiOperations = operations;

type OperationName = keyof ApiOperations;
type OperationParameters<Name extends OperationName> = ApiOperations[Name]["parameters"];
type OperationRequest<Name extends OperationName> = ApiOperations[Name] extends {
  requestBody: { content: { "application/json": infer Body } };
}
  ? Body
  : never;
type OperationResponse<Name extends OperationName> = ApiOperations[Name] extends {
  responses: { 200: { content: { "application/json": infer Body } } };
}
  ? Body
  : ApiOperations[Name] extends { responses: { 202: { content: { "application/json": infer Body } } } }
    ? Body
    : unknown;

export interface ApiRequestOptions<Body = unknown> {
  baseUrl?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
  requestId?: string;
  body?: Body;
  idempotencyKey?: string;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly requestId?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export interface ApiOperationOptions<Name extends OperationName> extends ApiRequestOptions<OperationRequest<Name>> {
  parameters: OperationParameters<Name>;
}

export function apiBaseUrl(baseUrl = import.meta.env.VITE_API_BASE ?? ""): string {
  return baseUrl.replace(/\/+$/, "");
}

export async function apiRequest<ResponseBody, RequestBody = never>(
  path: string,
  options: ApiRequestOptions<RequestBody> = {},
): Promise<ResponseBody> {
  const headers = new Headers(options.headers);
  const method = options.method ?? (options.body === undefined ? "GET" : "POST");
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && !headers.has("X-CSRF-Token")) {
    const csrf =
      typeof document === "undefined"
        ? ""
        : (document.cookie
            .split(";")
            .map((item) => item.trim())
            .find((item) => item.startsWith("novel_agent_csrf="))
            ?.slice(17) ?? "");
    if (csrf) headers.set("X-CSRF-Token", decodeURIComponent(csrf));
  }
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.idempotencyKey) headers.set("Idempotency-Key", options.idempotencyKey);
  if (options.requestId) headers.set("X-Request-ID", options.requestId);
  const timeoutSignal = AbortSignal.timeout(options.timeoutMs ?? 30_000);
  const signal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal;
  const response = await fetch(`${apiBaseUrl(options.baseUrl)}${path}`, {
    method,
    credentials: options.credentials ?? "include",
    headers,
    signal,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) {
    const details = await response.json().catch(() => undefined);
    const message =
      details && typeof details === "object" && "detail" in details && typeof details.detail === "string"
        ? details.detail
        : `Request failed (${response.status})`;
    throw new ApiRequestError(message, response.status, response.headers.get("X-Request-ID") ?? undefined, details);
  }
  return (await response.json()) as ResponseBody;
}

function interpolatePath(path: string, parameters: Record<string, unknown> | undefined): string {
  return path.replace(/\{([^}]+)\}/g, (_match, key: string) => {
    const value = parameters?.[key];
    if (value === undefined || value === null) throw new Error(`Missing API path parameter: ${key}`);
    return encodeURIComponent(String(value));
  });
}

function appendQuery(path: string, parameters: Record<string, unknown> | undefined): string {
  if (!parameters) return path;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(parameters)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) value.forEach((item) => query.append(key, String(item)));
    else query.set(key, String(value));
  }
  const encoded = query.toString();
  if (!encoded) return path;
  return `${path}${path.includes("?") ? "&" : "?"}${encoded}`;
}

export function apiOperation<Name extends OperationName>(
  operation: Name,
  options: ApiOperationOptions<Name>,
): Promise<OperationResponse<Name>> {
  const { parameters, ...requestOptions } = options;
  const parts = parameters as { path?: Record<string, unknown>; query?: Record<string, unknown> };
  const definition = operationDefinitions[operation];
  const path = definition.path;
  const url = appendQuery(interpolatePath(path, parts.path), parts.query);
  const headers = new Headers(requestOptions.headers);
  const operationHeaders = (parameters as { header?: Record<string, string | null | undefined> }).header;
  const idempotencyKey = requestOptions.idempotencyKey ?? operationHeaders?.["Idempotency-Key"] ?? undefined;

  return apiRequest<OperationResponse<Name>, OperationRequest<Name>>(url, {
    ...requestOptions,
    method: definition.method as ApiRequestOptions["method"],
    headers,
    idempotencyKey,
  });
}

export interface JobEventEnvelope<Payload extends Record<string, unknown> = Record<string, unknown>> {
  job_id: string;
  sequence: number;
  type: string;
  payload: Payload;
  created_at: string;
}

export interface JobEventsResponse<
  Job = Record<string, unknown>,
  Payload extends Record<string, unknown> = Record<string, unknown>,
> {
  job: Job;
  events: JobEventEnvelope<Payload>[];
  next_after_sequence: number;
}

export interface CreateJobResponse {
  id: string;
  novel_id: string;
  status: "queued" | "running" | "waiting_review" | "completed" | "failed" | "cancelled" | "interrupted";
}
