import { useState, type FormEvent, type ChangeEvent } from "react";
import { useSession } from "../../auth/SessionProvider";

export function RegisterPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { register } = useSession();
  const [form, setForm] = useState({ username: "", email: "", display_name: "", tenant_name: "", password: "" });
  const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    try { await register(form); onNavigate("/app/workspaces/current/overview"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "注册失败"); }
    finally { setPending(false); }
  }
  const update = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  return <main className="auth-page"><form className="auth-form" onSubmit={submit} aria-labelledby="register-title">
    <span className="eyebrow">NOVEL AGENT</span><h1 id="register-title">创建工作区</h1>
    <label>用户名<input value={form.username} onChange={update("username")} required autoComplete="username" /></label>
    <label>显示名称<input value={form.display_name} onChange={update("display_name")} required /></label>
    <label>工作区名称<input value={form.tenant_name} onChange={update("tenant_name")} required /></label>
    <label>邮箱<input type="email" value={form.email} onChange={update("email")} /></label>
    <label>密码<input type="password" value={form.password} onChange={update("password")} required minLength={8} autoComplete="new-password" /></label>
    {error && <p role="alert">{error}</p>}<button className="primary-button" disabled={pending}>{pending ? "创建中…" : "创建工作区"}</button>
    <button type="button" className="text-button" onClick={() => onNavigate("/login")}>返回登录</button>
  </form></main>;
}
