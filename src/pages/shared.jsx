export const STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];
export const label = (s) => s.replace("_", " ").toLowerCase();
export const fmt = (d) => (d ? new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—");

export const Badge = ({ s }) => <span className={`badge ${s}`}>{label(s)}</span>;

export function Card({ c, children }) {
  return (
    <article className={`card pr-${c.priority}`}>
      <div className="card-head">
        <h3>{c.title}</h3>
        <Badge s={c.status} />
      </div>
      <p className="meta">{c.category} · {c.location} · {c.priority.toLowerCase()} priority · {fmt(c.createdAt)}</p>
      {c.description && <p>{c.description}</p>}
      {c.student && <p className="meta">Reported by {c.student.name}{c.student.roomNo ? ` (${c.student.roomNo})` : ""}</p>}
      <p className="meta">Assigned to: {c.assignedStaff ? c.assignedStaff.name : "nobody yet"}</p>
      {c.remarks && <p className="note">Staff note: {c.remarks}</p>}
      {c.resolvedAt && <p className="meta">Resolved {fmt(c.resolvedAt)}</p>}
      {children}
    </article>
  );
}

export function StatusEditor({ c, onSave }) {
  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    onSave(c.id, f.get("status"), f.get("remarks"));
  };
  return (
    <form className="inline" onSubmit={submit}>
      <select name="status" defaultValue={c.status}>
        {STATUSES.filter((s) => s !== "PENDING").map((s) => <option key={s} value={s}>{label(s)}</option>)}
      </select>
      <input name="remarks" placeholder="Note about the work" defaultValue={c.remarks || ""} />
      <button>Update</button>
    </form>
  );
}
