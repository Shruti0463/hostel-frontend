import { useEffect, useState } from "react";
import { api } from "../api";
import { Card, STATUSES, label } from "./shared";

const empty = { title: "", category: "ELECTRICAL", location: "", priority: "MEDIUM", description: "" };

export default function Student() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(empty);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("ALL");
  const load = () => api("/api/complaints/my").then(setList).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try { await api("/api/complaints", "POST", f); setF(empty); load(); }
    catch (x) { setErr(x.message); }
  };
  const remove = async (id) => { await api(`/api/complaints/${id}`, "DELETE"); load(); };
  const shown = filter === "ALL" ? list : list.filter((c) => c.status === filter);

  return (
    <div className="two">
      <section className="panel">
        <h2>Report a problem</h2>
        <form onSubmit={submit}>
          <label>What is wrong?<input required value={f.title} onChange={set("title")} placeholder="Tube light not working" /></label>
          <label>Type
            <select value={f.category} onChange={set("category")}>
              {["ELECTRICAL", "PLUMBING", "FURNITURE", "CLEANING", "OTHER"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label>Where?<input required value={f.location} onChange={set("location")} placeholder="Block B, room 204" /></label>
          <label>How urgent?
            <select value={f.priority} onChange={set("priority")}>
              {["LOW", "MEDIUM", "HIGH"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label>Details<textarea rows={3} value={f.description} onChange={set("description")} /></label>
          {err && <p className="error">{err}</p>}
          <button>Submit complaint</button>
        </form>
      </section>
      <section>
        <div className="row"><h2>My complaints</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        </div>
        {shown.length === 0 && <p className="muted">Nothing here yet. Submit a complaint and it will show up with its progress.</p>}
        {shown.map((c) => (
          <Card key={c.id} c={c}>
            {c.status === "PENDING" && <button className="ghost danger" onClick={() => remove(c.id)}>Withdraw</button>}
          </Card>
        ))}
      </section>
    </div>
  );
}
