import { useEffect, useState, type ReactNode } from "react";
import { useSession } from "../auth/SessionProvider";
import App from "../App";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { WorkspaceOverviewPage } from "../pages/workspaces/WorkspaceOverviewPage";

function navigate(path: string) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function AppRouter() {
  const [path, setPath] = useState(() => window.location.pathname);
  const session = useSession();
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const go = (next: string) => navigate(next);
  if (session.status === "loading") return <div className="app-loading" role="status">正在读取会话…</div>;
  if (path === "/login") return <LoginPage onNavigate={go} />;
  if (path === "/register") return <RegisterPage onNavigate={go} />;
  if (path.startsWith("/app/workspaces/") && path.endsWith("/overview")) return <WorkspaceOverviewPage onNavigate={go} />;
  return <App />;
}

export function RouterLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} onClick={(event) => { event.preventDefault(); navigate(href); }}>{children}</a>;
}
