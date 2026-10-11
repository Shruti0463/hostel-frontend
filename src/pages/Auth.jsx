import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, session } from "../api";

const HOME = { STUDENT: "/student", STAFF: "/staff", ADMIN: "/admin" };

function Frame({ title, note, children }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <h1>Hostel Care</h1>
        <p>Report a fault, see who is fixing it, and know when it is done.</p>
      </aside>
      <section className="auth-form">
        <h2>{title}</h2>
        {children}
        <p className="muted">{note}</p>
      </section>
    </div>
  );
}

export function Login() {
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const { token, user } = await api("/api/auth/login", "POST", f);
      session.save(token, user); nav(HOME[user.role]);
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <Frame title="Log in" note={<>New student? <Link to="/register">Create an account</Link></>}>
      <form onSubmit={submit}>
        <label>Email<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        {err && <p className="error">{err}</p>}
        <button disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      </form>
    </Frame>
  );
}

export function Register() {
  const [f, setF] = useState({ name: "", email: "", password: "", roomNo: "" });
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try { await api("/api/auth/register", "POST", f); nav("/login"); }
    catch (x) { setErr(x.message); }
  };
  return (
    <Frame title="Create student account" note={<>Already registered? <Link to="/login">Log in</Link></>}>
      <form onSubmit={submit}>
        <label>Full name<input required value={f.name} onChange={set("name")} /></label>
        <label>Email<input type="email" required value={f.email} onChange={set("email")} /></label>
        <label>Room number<input placeholder="e.g. B-204" value={f.roomNo} onChange={set("roomNo")} /></label>
        <label>Password (6+ characters)<input type="password" minLength={6} required value={f.password} onChange={set("password")} /></label>
        {err && <p className="error">{err}</p>}
        <button>Create account</button>
      </form>
    </Frame>
  );
}
