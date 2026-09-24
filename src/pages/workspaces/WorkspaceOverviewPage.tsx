import { useWorkspace } from "../../workspaces/WorkspaceProvider";
import { useSession } from "../../auth/SessionProvider";

export function WorkspaceOverviewPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { workspace, workspaces, loading, error, selectWorkspace } = useWorkspace();
  const { user, logout } = useSession();
  if (loading) return <main className="app-loading">正在加载工作区…</main>;
  return <main className="workspace-overview"><header><div><span className="eyebrow">WORKSPACE</span><h1>{workspace?.name ?? user?.tenant_name ?? "工作区"}</h1></div><button onClick={() => void logout().then(() => onNavigate("/login"))}>退出登录</button></header>
    {error && <p role="alert">{error}</p>}<section className="overview-grid"><div><strong>{workspaces.length}</strong><span>可访问工作区</span></div><div><strong>{user?.role ?? "viewer"}</strong><span>当前角色</span></div></section>
    {workspaces.length > 1 && <label>切换工作区<select value={workspace?.id ?? ""} onChange={(event) => selectWorkspace(event.target.value)}>{workspaces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
    <button className="primary-button" onClick={() => onNavigate("/app")}>进入工作台</button>
  </main>;
}
