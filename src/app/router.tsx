import { useEffect, useState, type ReactNode } from "react";
import { useSession } from "../auth/SessionProvider";
import App from "../App";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { WorkspaceOverviewPage } from "../pages/workspaces/WorkspaceOverviewPage";
import { SettingsPage, type SettingsSection } from "../pages/settings/SettingsPage";
import type { WorkspaceView } from "../components/WorkspaceNav";
import { ResourcesPage } from "../pages/settings/ResourcesPage";
import type { ResourceKind } from "../features/resources/resourceSchemas";

export const NOVEL_VIEWS = ["overview", "write", "plan", "knowledge", "quality"] as const;
export const NOVEL_TOOLS = ["brief", "canon", "traces", "benchmarks", "memory"] as const;
export type NovelRouteView = (typeof NOVEL_VIEWS)[number];
export type NovelToolRoute = (typeof NOVEL_TOOLS)[number];

export function parseNovelRoute(path: string): { novelId: string; view: NovelRouteView } | null {
  const match = path.match(/^\/novels\/([^/]+)\/(overview|write|plan|knowledge|quality)\/?$/);
  return match ? { novelId: decodeURIComponent(match[1]), view: match[2] as NovelRouteView } : null;
}
export function parseNovelToolRoute(path: string): { novelId: string; tool: NovelToolRoute } | null {
  const match = path.match(/^\/novels\/([^/]+)\/tools\/(brief|canon|traces|benchmarks|memory)\/?$/);
  return match ? { novelId: decodeURIComponent(match[1]), tool: match[2] as NovelToolRoute } : null;
}

export function workspacePath(novelId: string, view: WorkspaceView | "overview" = "write") {
  return `/novels/${encodeURIComponent(novelId)}/${view}`;
}

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
  if (session.status === "loading")
    return (
      <div className="app-loading" role="status">
        正在读取会话…
      </div>
    );
  if (path === "/login") return <LoginPage onNavigate={go} />;
  if (path === "/register") return <RegisterPage onNavigate={go} />;
  if (path.startsWith("/app/workspaces/") && path.endsWith("/overview"))
    return <WorkspaceOverviewPage onNavigate={go} />;
  const novelRoute = parseNovelRoute(path);
  if (novelRoute)
    return (
      <App
        initialNovelId={novelRoute.novelId}
        initialView={novelRoute.view === "overview" ? "write" : novelRoute.view}
      />
    );
  const toolRoute = parseNovelToolRoute(path);
  if (toolRoute) return <App initialNovelId={toolRoute.novelId} initialDialog={toolRoute.tool} />;
  const settingsMatch = path.match(/^\/settings\/(models|resources|audit)\/?$/);
  if (settingsMatch) return <SettingsPage section={settingsMatch[1] as SettingsSection} onBack={() => go("/app")} />;
  const resourcesMatch = path.match(
    /^\/settings\/resources\/(content-types|styles|creative-templates|quality-policies)\/?$/,
  );
  if (resourcesMatch)
    return <ResourcesPage kind={resourcesMatch[1] as ResourceKind} onBack={() => go("/settings/resources")} />;
  return <App />;
}

export function RouterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
