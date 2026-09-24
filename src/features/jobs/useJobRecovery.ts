import { useCallback, useEffect, useState } from "react";
import type { RunJob } from "../../types";
import { getRunJobEvents } from "../../api";

export function useJobRecovery(job: RunJob | null | undefined, onRecovered?: (next: RunJob) => void) {
  const [recovering, setRecovering] = useState(false);
  const [error, setError] = useState("");
  const recover = useCallback(async () => {
    if (!job) return null;
    setRecovering(true);
    setError("");
    try {
      const result = await getRunJobEvents(job.id, 0);
      onRecovered?.(result.job);
      return result.job;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "无法恢复后台任务";
      setError(message);
      throw reason;
    } finally {
      setRecovering(false);
    }
  }, [job, onRecovered]);
  useEffect(() => {
    if (job && ["queued", "running"].includes(job.status)) void recover().catch(() => undefined);
  }, [job?.id]);
  return { recover, recovering, error };
}
