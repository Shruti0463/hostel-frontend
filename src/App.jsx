import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { session } from "./api";
import { Login, Register } from "./pages/Auth";
import Student from "./pages/Student";
import Staff from "./pages/Staff";
import Admin from "./pages/Admin";

const HOME = { STUDENT: "/student", STAFF: "/staff", ADMIN: "/admin" };

function Guard({ role, children }) {
  const u = session.user;
  if (!u || !session.token) return <Navigate to="/login" replace />;
  if (u.role !== role) return <Navigate to={HOME[u.role]} replace />;
  return <Shell user={u}>{children}</Shell>;
}

function Shell({ user, children }) {
  const nav = useNavigate();
  return (
    <>
      <header className="bar">
        <strong className="brand">Hostel Care</strong>
        <span className="who">{user.name} <em>{user.role.toLowerCase()}</em></span>
        <button className="ghost" onClick={() => { session.clear(); nav("/login"); }}>Log out</button>
      </header>
      <main className="wrap">{children}</main>
    </>
  );
}

export default function App() {
  const u = session.user;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student" element={<Guard role="STUDENT"><Student /></Guard>} />
      <Route path="/staff" element={<Guard role="STAFF"><Staff /></Guard>} />
      <Route path="/admin" element={<Guard role="ADMIN"><Admin /></Guard>} />
      <Route path="*" element={<Navigate to={u ? HOME[u.role] : "/login"} replace />} />
    </Routes>
  );
}
