import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAuthStatus, loginAuth, logoutAuth, registerAuth } from "../api";
import type { AuthSession, AuthStatus, AuthUser } from "../types";

interface SessionContextValue {
  status: "loading" | "ready" | "error";
  enabled: boolean;
  user: AuthUser | null;
  error: string;
  refresh: () => Promise<AuthStatus | undefined>;
  login: (identifier: string, password: string) => Promise<AuthSession>;
  register: (payload: Parameters<typeof registerAuth>[0]) => Promise<AuthSession>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Pick<SessionContextValue, "status" | "enabled" | "user" | "error">>({
    status: "loading",
    enabled: false,
    user: null,
    error: "",
  });

  const refresh = useCallback(async () => {
    try {
      const next = await getAuthStatus();
      setState({ status: "ready", enabled: next.enabled, user: next.user, error: "" });
      return next;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "无法读取登录状态";
      setState((current) => ({ ...current, status: "error", error: message }));
      return undefined;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<SessionContextValue>(
    () => ({
      ...state,
      refresh,
      login: async (identifier, password) => {
        const session = await loginAuth(identifier, password);
        setState({ status: "ready", enabled: true, user: session.user, error: "" });
        return session;
      },
      register: async (payload) => {
        const session = await registerAuth(payload);
        setState({ status: "ready", enabled: true, user: session.user, error: "" });
        return session;
      },
      logout: async () => {
        await logoutAuth();
        setState((current) => ({ ...current, status: "ready", user: null, error: "" }));
      },
    }),
    [refresh, state],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  const [fallback, setFallback] = useState<Pick<SessionContextValue, "status" | "enabled" | "user" | "error">>({
    status: "loading",
    enabled: false,
    user: null,
    error: "",
  });
  useEffect(() => {
    if (value) return;
    let active = true;
    void getAuthStatus()
      .then((status) => {
        if (active) setFallback({ status: "ready", enabled: status.enabled, user: status.user, error: "" });
      })
      .catch((reason) => {
        if (active)
          setFallback({
            status: "error",
            enabled: false,
            user: null,
            error: reason instanceof Error ? reason.message : "无法读取登录状态",
          });
      });
    return () => {
      active = false;
    };
  }, [value]);
  const fallbackValue = useMemo<SessionContextValue>(
    () => ({
      ...fallback,
      refresh: async () => {
        const status = await getAuthStatus();
        setFallback({ status: "ready", enabled: status.enabled, user: status.user, error: "" });
        return status;
      },
      login: async (identifier, password) => {
        const session = await loginAuth(identifier, password);
        setFallback({ status: "ready", enabled: true, user: session.user, error: "" });
        return session;
      },
      register: async (payload) => {
        const session = await registerAuth(payload);
        setFallback({ status: "ready", enabled: true, user: session.user, error: "" });
        return session;
      },
      logout: async () => {
        await logoutAuth();
        setFallback((current) => ({ ...current, status: "ready", user: null, error: "" }));
      },
    }),
    [fallback],
  );
  return value ?? fallbackValue;
}
