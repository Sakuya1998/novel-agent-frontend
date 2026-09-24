import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RunJob } from "../../types";

const getRunJobEvents = vi.hoisted(() => vi.fn());
vi.mock("../../api", () => ({ getRunJobEvents }));
import { useJobRecovery } from "./useJobRecovery";

const job: RunJob = {
  id: "job-1",
  novel_id: "novel-1",
  action: "run",
  status: "running",
  request: {},
  current_node: "writer",
  error: "",
  cancel_requested: false,
  created_at: "",
  updated_at: "",
};

describe("useJobRecovery", () => {
  it("recovers an active persisted job on mount", async () => {
    const next = { ...job, status: "waiting_review" as const };
    getRunJobEvents.mockResolvedValue({ job: next, events: [], next_after_sequence: 0 });
    const onRecovered = vi.fn();
    renderHook(() => useJobRecovery(job, onRecovered));
    await waitFor(() => expect(onRecovered).toHaveBeenCalledWith(next));
    expect(getRunJobEvents).toHaveBeenCalledWith("job-1", 0);
  });
});
