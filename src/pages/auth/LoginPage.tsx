import { useState, type FormEvent } from "react";
import { useSession } from "../../auth/SessionProvider";

export function LoginPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { login, error: sessionError } = useSession();
  const [identifier, setIdentifier] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    try { await login(identifier, password); onNavigate("/app/workspaces/current/overview"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "登录失败"); }
    finally { setPending(false); }
  }
  return <main className="auth-page"><form className="auth-form" onSubmit={submit} aria-labelledby="login-title">
    <span className="eyebrow">NOVEL AGENT</span><h1 id="login-title">登录工作区</h1>
    <label>用户名或邮箱<input value={identifier} onChange={(event) => setIdentifier(event.target.value)} required autoComplete="username" /></label>
    <label>密码<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
    {(error || sessionError) && <p role="alert">{error || sessionError}</p>}
    <button className="primary-button" disabled={pending}>{pending ? "登录中…" : "登录"}</button>
    <button type="button" className="text-button" onClick={() => onNavigate("/register")}>创建工作区账号</button>
  </form></main>;
}
