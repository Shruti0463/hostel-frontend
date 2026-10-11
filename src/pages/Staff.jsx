import { useEffect, useState } from "react";
import { api } from "../api";
import { Card, StatusEditor } from "./shared";

export default function Staff() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const load = () => api("/api/complaints/assigned").then(setList).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const save = async (id, status, remarks) => {
    try { await api(`/api/complaints/${id}/status`, "PUT", { status, remarks }); load(); }
    catch (x) { setErr(x.message); }
  };
  return (
    <section>
      <h2>My assigned work</h2>
      {err && <p className="error">{err}</p>}
      {list.length === 0 && <p className="muted">No complaints are assigned to you right now.</p>}
      <div className="grid">
        {list.map((c) => <Card key={c.id} c={c}><StatusEditor c={c} onSave={save} /></Card>)}
      </div>
    </section>
  );
}
