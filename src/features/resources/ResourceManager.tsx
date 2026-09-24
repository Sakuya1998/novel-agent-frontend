import { useEffect, useMemo, useState } from "react";
import { useSession } from "../../auth/SessionProvider";
import { useWorkspace } from "../../workspaces/WorkspaceProvider";
import { can } from "../../permissions/permissions";
import {
  copyStyleResource,
  createResource,
  listResourceVersions,
  listResources,
  transitionResource,
  updateResource,
  type Resource,
  type ResourceKind,
} from "./resourceSchemas";

const labels: Record<ResourceKind, string> = {
  "content-types": "内容类型",
  styles: "风格库",
  "creative-templates": "创作模板",
  "quality-policies": "质量策略",
};
export function ResourceManager({ kind }: { kind: ResourceKind }) {
  const { workspace } = useWorkspace();
  const { user } = useSession();
  const [items, setItems] = useState<Resource[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Resource>();
  const [versions, setVersions] = useState<unknown>();
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", key: "", description: "" });
  const editable = can(user?.role, "resources:manage");
  const load = async () => {
    if (!workspace) return;
    try {
      setItems(await listResources(workspace.id, kind, { status: status || undefined, search: search || undefined }));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "资源加载失败");
    }
  };
  useEffect(() => {
    void load();
  }, [workspace?.id, kind, status]);
  const visible = useMemo(
    () => items.filter((item) => !search || `${item.name} ${item.key}`.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );
  async function transition(action: "publish" | "disable") {
    if (!workspace || !selected || !editable) return;
    if (action === "publish" && !window.confirm("发布后仅影响新作品和后续生效版本，不会改变历史快照。继续吗？")) return;
    await transitionResource(workspace.id, kind, selected.id, action, selected.version);
    await load();
  }
  async function saveDraft() {
    if (!workspace || !selected || !editable) return;
    await updateResource(workspace.id, kind, selected.id, { ...draft, expected_version: selected.version });
    setEditing(false);
    await load();
  }
  return (
    <section className="resource-manager">
      <header>
        <div>
          <span className="eyebrow">RESOURCES</span>
          <h2>{labels[kind]}</h2>
        </div>
        {editable ? (
          <button
            className="primary-button"
            onClick={() => {
              const key = `resource-${Date.now()}`;
              void createResource(workspace!.id, kind, { key, name: "新资源", description: "", payload: {} }).then(() =>
                load(),
              );
            }}
          >
            新建
          </button>
        ) : (
          <span className="muted-row">只读</span>
        )}
      </header>
      <div className="resource-filters">
        <input placeholder="搜索资源" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="disabled">已停用</option>
        </select>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="resource-list">
        {visible.map((item) => (
          <button
            className={selected?.id === item.id ? "resource-row active" : "resource-row"}
            key={item.id}
            onClick={() => {
              setSelected(item);
              setDraft({ name: item.name, key: item.key, description: item.description ?? "" });
              if (workspace) void listResourceVersions(workspace.id, kind, item.id).then(setVersions);
            }}
          >
            <strong>{item.name}</strong>
            <span>{item.key}</span>
            <em>
              {item.status ?? "draft"} · v{item.version ?? 1}
            </em>
          </button>
        ))}
        {visible.length === 0 && <div className="empty-sidebar">暂无资源</div>}
      </div>
      {selected && (
        <aside className="resource-detail">
          <h3>{selected.name}</h3>
          {editing ? (
            <div className="resource-edit">
              <input
                aria-label="资源名称"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
              <input
                aria-label="资源键"
                value={draft.key}
                onChange={(e) => setDraft({ ...draft, key: e.target.value })}
              />
              <textarea
                aria-label="资源描述"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
              <button className="primary-button" onClick={() => void saveDraft()}>
                保存修改
              </button>
            </div>
          ) : (
            <p>{selected.description || "暂无描述"}</p>
          )}
          {versions ? <small>版本历史已加载</small> : null}
          {editable && (
            <div>
              <button className="secondary-button" onClick={() => setEditing(true)}>
                编辑
              </button>
              {kind === "styles" && (
                <button
                  className="secondary-button"
                  onClick={() =>
                    workspace &&
                    void copyStyleResource(workspace.id, selected.id, {
                      key: `${selected.key}-copy`,
                      name: `${selected.name} 副本`,
                      description: selected.description ?? "",
                    }).then(load)
                  }
                >
                  复制
                </button>
              )}
              <button className="secondary-button" onClick={() => void transition("publish")}>
                发布
              </button>
              <button className="secondary-button" onClick={() => void transition("disable")}>
                停用
              </button>
            </div>
          )}
        </aside>
      )}
    </section>
  );
}
