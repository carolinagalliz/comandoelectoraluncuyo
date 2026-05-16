import { useEffect, useState } from "react";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import { auth } from "./firebase";
import Fiscal from "./pages/Fiscal.jsx";
import Comando from "./pages/Comando.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rol, setRol] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setRol("");
        return;
      }

      if (user.email === "fiscal@re.com") {
        setRol("fiscal");
      } else if (user.email === "comando@re.com") {
        setRol("comando");
      } else if (user.email === "admin@re.com") {
        setRol("admin");
      }
    });

    return () => unsub();
  }, []);

  async function ingresar() {
    try {
      const credenciales = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const mail = credenciales.user.email;

      if (mail === "fiscal@re.com") {
        setRol("fiscal");
      } else if (mail === "comando@re.com") {
        setRol("comando");
      } else if (mail === "admin@re.com") {
        setRol("admin");
      }
    } catch (error) {
      console.error(error);
      alert("Credenciales incorrectas.");
    }
  }

  async function salir() {
    await signOut(auth);

    setRol("");
    setEmail("");
    setPassword("");
  }

  if (!rol) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <div className="status-badge">RE · SISTEMA EN LÍNEA</div>

          <h1>RE · Comando Electoral UNCuyo</h1>

          <p>
            Ingreso restringido para fiscales, comando electoral y
            administración.
          </p>

          <label>Email</label>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresar email"
          />

          <label>Contraseña</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ingresar()}
            placeholder="Ingresar contraseña"
          />

          <button className="primary" onClick={ingresar}>
            Entrar
          </button>

          <p className="mini">
            Acceso interno restringido. Las credenciales serán reemplazadas por
            autenticación real.
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
            <button onClick={() => setRol("fiscal")}>Fiscal</button>

            <button onClick={() => setRol("comando")}>Comando</button>

            <button onClick={() => setRol("admin")}>Admin</button>

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
  const [hora, setHora] = useState(new Date().toLocaleTimeString("es-AR"));

  useEffect(() => {
    const interval = setInterval(() => {
      setHora(new Date().toLocaleTimeString("es-AR"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return hora;
}