import { useEffect, useState } from "react";
import { api } from "../api";
import { Card, StatusEditor, label } from "./shared";

export default function Admin() {
  const [tab, setTab] = useState("complaints");
  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [students, setStudents] = useState([]);
  const [err, setErr] = useState("");
  const [sf, setSf] = useState({ name: "", email: "", password: "", specialization: "" });

  const load = () =>
    Promise.all([api("/api/admin/stats"), api("/api/complaints"), api("/api/admin/staff"), api("/api/admin/students")])
      .then(([a, b, c, d]) => { setStats(a); setComplaints(b); setStaff(c); setStudents(d); })
      .catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const run = async (fn) => { setErr(""); try { await fn(); await load(); } catch (x) { setErr(x.message); } };
  const assign = (id, staffId) => staffId && run(() => api(`/api/complaints/${id}/assign/${staffId}`, "PUT"));
  const status = (id, s, remarks) => run(() => api(`/api/complaints/${id}/status`, "PUT", { status: s, remarks }));
  const addStaff = (e) => { e.preventDefault(); run(async () => { await api("/api/admin/staff", "POST", sf); setSf({ name: "", email: "", password: "", specialization: "" }); }); };

  const tiles = [["total", "Total"], ["PENDING", "Pending"], ["IN_PROGRESS", "In progress"], ["RESOLVED", "Resolved"]];
  const UserTable = ({ rows, cols }) => (
    <table>
      <thead><tr>{cols.map(([, h]) => <th key={h}>{h}</th>)}<th></th></tr></thead>
      <tbody>{rows.map((u) => (
        <tr key={u.id}>{cols.map(([k]) => <td key={k}>{u[k] || "—"}</td>)}
          <td><button className="ghost danger" onClick={() => run(() => api(`/api/admin/users/${u.id}`, "DELETE"))}>Remove</button></td></tr>
      ))}</tbody>
    </table>
  );

  return (
    <>
      <div className="tiles">
        {tiles.map(([k, t]) => <div key={k} className={`tile ${k}`}><b>{stats[k] ?? 0}</b><span>{t}</span></div>)}
      </div>
      <nav className="tabs">
        {["complaints", "staff", "students"].map((t) => (
          <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
      </nav>
      {err && <p className="error">{err}</p>}

      {tab === "complaints" && (
        <div className="grid">
          {complaints.length === 0 && <p className="muted">No complaints have been filed yet.</p>}
          {complaints.map((c) => (
            <Card key={c.id} c={c}>
              <div className="inline">
                <select value={c.assignedStaff?.id || ""} onChange={(e) => assign(c.id, e.target.value)}>
                  <option value="">Assign to…</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.name}{s.specialization ? ` (${s.specialization})` : ""}</option>)}
                </select>
                <button className="ghost danger" onClick={() => run(() => api(`/api/complaints/${c.id}`, "DELETE"))}>Delete</button>
              </div>
              <StatusEditor c={c} onSave={status} />
            </Card>
          ))}
        </div>
      )}

      {tab === "staff" && (
        <div className="two">
          <form className="panel" onSubmit={addStaff}>
            <h2>Add staff member</h2>
            <label>Name<input required value={sf.name} onChange={(e) => setSf({ ...sf, name: e.target.value })} /></label>
            <label>Email<input type="email" required value={sf.email} onChange={(e) => setSf({ ...sf, email: e.target.value })} /></label>
            <label>Skill<input placeholder="Electrician, Plumber…" value={sf.specialization} onChange={(e) => setSf({ ...sf, specialization: e.target.value })} /></label>
            <label>Password<input type="password" minLength={6} required value={sf.password} onChange={(e) => setSf({ ...sf, password: e.target.value })} /></label>
            <button>Add staff</button>
          </form>
          <UserTable rows={staff} cols={[["name", "Name"], ["email", "Email"], ["specialization", "Skill"]]} />
        </div>
      )}

      {tab === "students" && <UserTable rows={students} cols={[["name", "Name"], ["email", "Email"], ["roomNo", "Room"]]} />}
    </>
  );
}
