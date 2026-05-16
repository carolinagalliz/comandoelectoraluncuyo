import { useEffect, useState } from "react";
import Fiscal from "./pages/Fiscal.jsx";
import Comando from "./pages/Comando.jsx";
import Admin from "./pages/Admin.jsx";

const CODIGO_FISCAL = "RE2026";
const CODIGO_COMANDO = "TOMAS2026";
const CODIGO_ADMIN = "ADMIN2026";

export default function App() {
  const [codigo, setCodigo] = useState("");
  const [rol, setRol] = useState(localStorage.getItem("cieu_rol") || "");

  function ingresar() {
    const limpio = codigo.trim();

    if (limpio === CODIGO_FISCAL) {
      localStorage.setItem("cieu_rol", "fiscal");
      setRol("fiscal");
      return;
    }

    if (limpio === CODIGO_COMANDO) {
      localStorage.setItem("cieu_rol", "comando");
      setRol("comando");
      return;
    }

    if (limpio === CODIGO_ADMIN) {
      localStorage.setItem("cieu_rol", "admin");
      setRol("admin");
      return;
    }

    alert("Código incorrecto.");
  }

  function salir() {
    localStorage.removeItem("cieu_rol");
    setRol("");
    setCodigo("");
  }

  if (!rol) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <div className="status-badge">RE · SISTEMA EN LÍNEA</div>
          <h1>RE · Comando Electoral UNCuyo</h1>
          <p>
            Ingreso restringido para fiscales, comando electoral y administración.
          </p>

          <label>Código de acceso</label>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ingresar()}
            placeholder="Ingresar código"
          />

          <button className="primary" onClick={ingresar}>
            Entrar
          </button>

          <p className="mini">
            Códigos iniciales: RE2026 fiscal · TOMAS2026 comando · ADMIN2026 admin.
            Después los cambiamos por login real.
          </p>
        </section>
      </main>
    );
  }

  return (
   <>
  <header>

    <div className="top-live-bar">
      <div className="live-left">
        <span className="live-dot"></span>
        SISTEMA OPERATIVO RE · ACTIVO
      </div>

      <div className="live-right">
        <div className="live-chip">
          ⚡ FLUJO: <span id="rpmCounter">0</span> reportes/min
        </div>

        <div className="live-chip">
          🕒 <LiveClock /> · MODO {rol.toUpperCase()}
        </div>
      </div>
    </div>

    <div className="brand">
      <div>
        <h1>RE · Comando Electoral UNCuyo</h1>

        <div className="subtitle">
          Trayectoria y Renovación · {rol.toUpperCase()}
        </div>
      </div>

    <div className="top-actions">
      <button onClick={() => setRol("fiscal")}>
        Fiscal
      </button>

      <button onClick={() => setRol("comando")}>
        Comando
      </button>

      <button onClick={() => setRol("admin")}>
        Admin
      </button>

      <button className="danger" onClick={salir}>
        Salir
      </button>
    </div>
  </div>
</header>

      {rol === "fiscal" && <Fiscal />}
      {rol === "comando" && <Comando />}
      {rol === "admin" && <Admin />}
    </>
  );
}
function LiveClock() {
  const [hora, setHora] = useState(
    new Date().toLocaleTimeString("es-AR")
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setHora(
        new Date().toLocaleTimeString("es-AR")
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return hora;
}
