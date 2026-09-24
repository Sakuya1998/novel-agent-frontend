import { afterEach, describe, expect, it, vi } from "vitest";
import { apiOperation } from "./client";

describe("typed API client", () => {
  afterEach(() => vi.restoreAllMocks());

  it("builds a versioned job events request from generated operation types", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          job: { id: "job-1" },
          events: [],
          next_after_sequence: 4,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await apiOperation("get_run_job_events_api_jobs__job_id__events_getV1", {
      parameters: { path: { job_id: "job/1" }, query: { after_sequence: 4, limit: 10 } },
    });

    expect(response).toMatchObject({ next_after_sequence: 4 });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/jobs/job%2F1/events?after_sequence=4&limit=10",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });

  it("forwards generated idempotency header for job creation", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "job-1" }), {
        status: 202,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await apiOperation("create_run_job_api_novels__novel_id__jobs_run_postV1", {
      parameters: { path: { novel_id: "novel-1" }, header: { "Idempotency-Key": "request-1" } },
    });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Idempotency-Key")).toBe("request-1");
  });
});
