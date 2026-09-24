import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { listWorkspaces } from "../api";
import { useSession } from "../auth/SessionProvider";

export interface WorkspaceSummary {
  id: string;
  tenant_id?: string;
  name: string;
  role?: "owner" | "editor" | "viewer";
  [key: string]: unknown;
}

interface WorkspaceContextValue {
  workspaces: WorkspaceSummary[];
  workspace: WorkspaceSummary | null;
  workspaceId: string | null;
  loading: boolean;
  error: string;
  selectWorkspace: (workspaceId: string) => void;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
const SELECTED_WORKSPACE_KEY = "novel_agent_workspace_id";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { status: sessionStatus, user } = useSession();
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(() => localStorage.getItem(SELECTED_WORKSPACE_KEY));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    if (sessionStatus !== "ready" || !user) {
      setWorkspaces([]);
      return;
    }
    setLoading(true);
    try {
      const response = await listWorkspaces();
      const items = response.items as WorkspaceSummary[];
      setWorkspaces(items);
      setWorkspaceId((current) => {
        const next = items.some((item) => item.id === current) ? current : (items[0]?.id ?? null);
        if (next) localStorage.setItem(SELECTED_WORKSPACE_KEY, next);
        else localStorage.removeItem(SELECTED_WORKSPACE_KEY);
        return next;
      });
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "无法读取工作区");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [sessionStatus, user?.id]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaces,
      workspace: workspaces.find((item) => item.id === workspaceId) ?? null,
      workspaceId,
      loading,
      error,
      selectWorkspace: (next) => {
        setWorkspaceId(next);
        localStorage.setItem(SELECTED_WORKSPACE_KEY, next);
      },
      refresh,
    }),
    [error, loading, refresh, workspaceId, workspaces],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  return (
    value ?? {
      workspaces: [],
      workspace: null,
      workspaceId: null,
      loading: false,
      error: "",
      selectWorkspace: () => undefined,
      refresh: async () => undefined,
    }
  );
}
