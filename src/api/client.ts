import type { operations, paths } from "./generated/schema";

export type ApiPaths = paths;
export type ApiOperations = operations;

export interface ApiRequestOptions<Body = unknown> {
  baseUrl?: string;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  signal?: AbortSignal;
  body?: Body;
  idempotencyKey?: string;
}

export function apiBaseUrl(baseUrl = import.meta.env.VITE_API_BASE ?? ""): string {
  return baseUrl.replace(/\/+$/, "");
}

export async function apiRequest<ResponseBody, RequestBody = never>(
  path: string,
  options: ApiRequestOptions<RequestBody> = {},
): Promise<ResponseBody> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.idempotencyKey) headers.set("Idempotency-Key", options.idempotencyKey);
  const response = await fetch(`${apiBaseUrl(options.baseUrl)}${path}`, {
    method: options.body === undefined ? "GET" : "POST",
    credentials: options.credentials ?? "include",
    headers,
    signal: options.signal,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return await response.json() as ResponseBody;
}

export interface JobEventEnvelope<Payload extends Record<string, unknown> = Record<string, unknown>> {
  job_id: string;
  sequence: number;
  type: string;
  payload: Payload;
  created_at: string;
}

export interface JobEventsResponse<Job = Record<string, unknown>, Payload extends Record<string, unknown> = Record<string, unknown>> {
  job: Job;
  events: JobEventEnvelope<Payload>[];
  next_after_sequence: number;
}

export interface CreateJobResponse {
  id: string;
  novel_id: string;
  status: "queued" | "running" | "waiting_review" | "completed" | "failed" | "cancelled" | "interrupted";
}
