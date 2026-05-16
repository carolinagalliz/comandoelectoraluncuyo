import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase.js";
import { calcularProyeccion, estadoPorcentaje } from "../logic/calcularProyeccion.js";

export default function Comando() {
  const [reportes, setReportes] = useState([]);
  const [ultimoReporte, setUltimoReporte] = useState(null);
  const cantidadAnterior = useRef(0);
  const probabilidadAnterior = useRef(0);
  const [movimientoProbabilidad, setMovimientoProbabilidad] = useState("");

useEffect(() => {
  const q = query(
  collection(db, "boca_urna_reportes"),
  where("activo", "==", true)
  );

  const unsub = onSnapshot(q, (snap) => {
    const nuevosReportes = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (
      cantidadAnterior.current > 0 &&
      nuevosReportes.length > cantidadAnterior.current
    ) {
      const nuevo = nuevosReportes[0];

      setUltimoReporte(nuevo);

      try {
        const audio = new Audio(
          "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
        );

        audio.volume = 0.35;
        audio.play();
      } catch (error) {
        console.log("Sonido bloqueado por el navegador.");
      }

      setTimeout(() => {
        setUltimoReporte(null);
      }, 6500);
    }

    cantidadAnterior.current = nuevosReportes.length;

    const ahora = Date.now();

    const ultimosMinuto = nuevosReportes.filter((r) => {
      if (!r.creadoEn?.seconds) return false;

      const fecha = r.creadoEn.seconds * 1000;

      return ahora - fecha < 60000;
    });

    const rpm = ultimosMinuto.length;

    const rpmNode = document.getElementById("rpmCounter");

    if (rpmNode) {
      rpmNode.textContent = rpm;
    }

    setReportes(nuevosReportes);
  });

  return () => unsub();
}, []);

const d = calcularProyeccion(reportes);
useEffect(() => {
  if (!reportes.length) return;

  if (d.probabilidad > probabilidadAnterior.current) {
    setMovimientoProbabilidad("sube");
  } else if (d.probabilidad < probabilidadAnterior.current) {
    setMovimientoProbabilidad("baja");
  }

  probabilidadAnterior.current = d.probabilidad;

  const timer = setTimeout(() => {
    setMovimientoProbabilidad("");
  }, 1400);

  return () => clearTimeout(timer);
}, [d.probabilidad, reportes.length]);

  return (
    <main>
      {ultimoReporte && (
        <div className="live-toast">
          <strong>🔔 Nuevo reporte recibido</strong>
          <span>
            {ultimoReporte.facultad} · {ultimoReporte.claustro} · Mesa{" "}
            {ultimoReporte.mesa || "sin número"}
          </span>
        </div>
      )}

     <section className="hero hero-comando">
  <div className="panel">
    <h2>Probabilidad proyectada de triunfo</h2>

    <div className={`mega probabilidad-animada ${movimientoProbabilidad}`}>
      {d.probabilidad}%
    </div>

    <div className="progress">
      <div className="bar" style={{ width: `${d.probabilidad}%` }} />
    </div>

    <div className={`estado-electoral ${estadoElectoral(d).clase}`}>
      {estadoElectoral(d).texto}
    </div>

    <p className="mini">{lecturaGeneral(d, reportes.length)}</p>
  </div>

  <div className="panel">
    <h2>Lectura estratégica</h2>
    <Alertas data={d} reportes={reportes} />
  </div>

  <div className="panel feed-panel">
    <h2>Feed táctico en vivo</h2>
    <FeedTactico reportes={reportes} />
  </div>
</section>
      <section className="stats">
        <Stat n={reportes.length} t="Reportes cargados" />
        <Stat n={Math.round(d.ismaelP)} t="Votos Ismael ponderados" />
        <Stat n={Math.round(d.oposicionP)} t="Votos oposición ponderados" />
        <Stat n={d.votosBrutos} t="Votos brutos reportados" />
        <Stat n={`${d.margen.toFixed(1)}%`} t="Margen Ismael" />
        <Stat n={`${d.confianzaPromedio}%`} t="Confianza muestra" />
      </section>

      <section className="panel">
        <h2>Mapa de calor electoral</h2>
        <p className="mini">
          Lectura rápida por unidad académica según reportes cargados.
        </p>

        <MapaCalor buckets={d.porFacultad} />
      </section>

      <section className="panel">
        <h2>Proyección por unidad académica</h2>
        <TablaBuckets buckets={d.porFacultad} />
      </section>

      <section className="panel">
        <h2>Proyección por claustro</h2>
        <TablaBuckets buckets={d.porClaustro} />
      </section>

      <section className="panel">
        <h2>Últimos reportes</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Claustro</th>
                <th>Mesa</th>
                <th>Ismael</th>
                <th>Oposición</th>
                <th>Blancos</th>
                <th>Confianza</th>
                <th>Fuente</th>
                <th>Observaciones</th>
              </tr>
            </thead>

            <tbody>
              {reportes.slice(0, 80).map((r) => (
                <tr key={r.id}>
                  <td>{r.facultad}</td>
                  <td>{r.claustro}</td>
                  <td>{r.mesa}</td>
                  <td>{r.ismael}</td>
                  <td>{r.oposicion}</td>
                  <td>{r.blancos}</td>
                  <td>
                    <span className="pill neutral">{r.confianza}</span>
                  </td>
                  <td>{r.fuente}</td>
                  <td>{r.observaciones}</td>
                </tr>
              ))}

              {!reportes.length && (
                <tr>
                  <td colSpan="9" className="mini">
                    Sin reportes cargados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
function Stat({ n, t }) {
  return (
    <div className="stat">
      <div className="num">{n}</div>
      <div className="txt">{t}</div>
    </div>
  );
}

function lecturaGeneral(d, total) {
  if (!total) return "Sin datos cargados. Cuando los fiscales envíen reportes, el comando se actualiza solo.";
  if (d.probabilidad >= 70) return "Escenario favorable para Ismael. Sostener fiscalización y cuidar unidades críticas.";
  if (d.probabilidad >= 50) return "Escenario competitivo. La elección puede definirse por participación y mesas disputadas.";
  return "Escenario crítico. Priorizar carga, mesas sensibles y unidades con margen adverso.";
}

function Alertas({ data, reportes }) {
  const alertas = [];

  if (!reportes.length) {
    alertas.push(["Sistema listo", "Esperando reportes de fiscales.", "neutral"]);
  } else {
    if (data.confianzaPromedio < 65) {
      alertas.push(["Confianza baja", "Hace falta más volumen o fuentes más confiables.", "warn"]);
    }

    if (data.margen > 8) {
      alertas.push(["Ventaja visible", "Ismael aparece arriba en la muestra ponderada.", "ok"]);
    } else if (data.margen > -4) {
      alertas.push(["Zona pareja", "La diferencia es estrecha. Importa cada mesa.", "warn"]);
    } else {
      alertas.push(["Riesgo electoral", "La oposición aparece arriba en la muestra cargada.", "bad"]);
    }

    const criticas = Object.entries(data.porFacultad)
      .map(([nombre, f]) => ({ nombre, pct: f.total ? (f.ismael / f.total) * 100 : 0 }))
      .filter((x) => x.pct < 48)
      .map((x) => x.nombre)
      .slice(0, 3);

    if (criticas.length) {
      alertas.push(["Unidades críticas", criticas.join(" · "), "bad"]);
    }
  }

  return (
    <div className="alertas">
      {alertas.map((a) => (
        <div className="alerta" key={a[0]}>
          <strong><span className={`pill ${a[2]}`}>{a[0]}</span></strong>
          {a[1]}
        </div>
      ))}
    </div>
  );
}

function TablaBuckets({ buckets }) {
  const rows = Object.entries(buckets)
    .map(([nombre, f]) => {
      const pct = f.total ? (f.ismael / f.total) * 100 : 0;
      const estado = estadoPorcentaje(pct);
      return { nombre, ...f, pct, estado };
    })
    .sort((a, b) => a.pct - b.pct);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Sector</th>
            <th>Reportes</th>
            <th>Ismael</th>
            <th>Oposición</th>
            <th>Blancos</th>
            <th>Total</th>
            <th>% Ismael</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => (
            <tr key={f.nombre}>
              <td><strong>{f.nombre}</strong></td>
              <td>{f.reportes}</td>
              <td>{f.ismael}</td>
              <td>{f.oposicion}</td>
              <td>{f.blancos}</td>
              <td>{f.total}</td>
              <td>{f.pct.toFixed(1)}%</td>
              <td><span className={`pill ${f.estado.clase}`}>{f.estado.texto}</span></td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan="8" className="mini">Sin datos.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
function MapaCalor({ buckets }) {
  const facultades = [
    "Derecho",
    "Ciencias Médicas",
    "Ciencias Políticas y Sociales",
    "FAD",
    "Filosofía y Letras",
    "Ciencias Económicas",
    "Ingeniería",
    "Ciencias Agrarias",
    "Odontología",
    "Educación",
    "Ciencias Exactas y Naturales",
    "Otra",
  ];

  return (
    <div className="heatmap-grid">
      {facultades.map((nombre) => {
        const f = buckets[nombre];
        const total = f?.total || 0;
        const pct = total ? (f.ismael / total) * 100 : 0;

        let clase = "sin-datos";
        let texto = "Sin datos";

        if (total > 0 && pct >= 55) {
          clase = "favorable";
          texto = "Favorable";
        } else if (total > 0 && pct >= 48) {
          clase = "disputada";
          texto = "Disputada";
        } else if (total > 0) {
          clase = "critica";
          texto = "Crítica";
        }

        return (
          <div className={`heat-card ${clase}`} key={nombre}>
            <strong>{nombre}</strong>
            <span>{texto}</span>
            <small>
              {total ? `${pct.toFixed(1)}% Ismael · ${total} votos` : "Esperando reportes"}
            </small>
          </div>
        );
      })}
    </div>
  );
}
function estadoElectoral(d) {
  if (d.probabilidad >= 68) {
    return {
      texto: "ESCENARIO FAVORABLE",
      clase: "favorable",
    };
  }

  if (d.probabilidad >= 48) {
    return {
      texto: "ELECCIÓN ABIERTA",
      clase: "abierta",
    };
  }

  return {
    texto: "ZONA CRÍTICA",
    clase: "critica",
  };
}

function FeedTactico({ reportes }) {
  const ultimos = reportes.slice(0, 8);

  if (!ultimos.length) {
    return (
      <div className="feed-empty">
        Esperando reportes tácticos...
      </div>
    );
  }

  return (
    <div className="feed-list">
      {ultimos.map((r) => (
        <div className="feed-item" key={r.id}>
          <span className="feed-time">
            {formatearHoraReporte(r)}
          </span>

          <div>
            <strong>{r.facultad || "Sin unidad"}</strong>
            <small>
              {r.claustro || "Sin claustro"} · Mesa {r.mesa || "s/n"}
            </small>
          </div>

          <span className="feed-badge">
            {Number(r.ismael || 0)} / {Number(r.oposicion || 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatearHoraReporte(r) {
  if (r.creadoEn?.seconds) {
    return new Date(r.creadoEn.seconds * 1000).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}