import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export default function Admin() {
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "boca_urna_reportes"));

    const unsub = onSnapshot(q, (snap) => {
      setReportes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  async function alternarActivo(r) {
    await updateDoc(doc(db, "boca_urna_reportes", r.id), {
      activo: !r.activo,
    });
  }

  async function borrar(r) {
    if (!confirm("¿Eliminar definitivamente este reporte?")) return;
    await deleteDoc(doc(db, "boca_urna_reportes", r.id));
  }

  function exportarCSV() {
    const cols = ["facultad", "claustro", "mesa", "ismael", "oposicion", "blancos", "confianza", "fuente", "observaciones", "activo"];
    const csv = [cols.join(",")]
      .concat(reportes.map((r) => cols.map((c) => csvCell(r[c])).join(",")))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "RE_REPORTES_COMANDO_ELECTORAL.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <section className="panel">
        <h2>Administración de reportes</h2>
        <p className="mini">
          Acá se puede desactivar un reporte dudoso, eliminar errores y exportar la base.
        </p>

        <div className="btns">
          <button className="primary" onClick={exportarCSV}>Exportar CSV</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Activo</th>
                <th>Unidad</th>
                <th>Claustro</th>
                <th>Mesa</th>
                <th>Ismael</th>
                <th>Oposición</th>
                <th>Blancos</th>
                <th>Confianza</th>
                <th>Fuente</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {reportes.map((r) => (
                <tr key={r.id}>
                  <td><span className={`pill ${r.activo ? "ok" : "bad"}`}>{r.activo ? "Sí" : "No"}</span></td>
                  <td>{r.facultad}</td>
                  <td>{r.claustro}</td>
                  <td>{r.mesa}</td>
                  <td>{r.ismael}</td>
                  <td>{r.oposicion}</td>
                  <td>{r.blancos}</td>
                  <td>{r.confianza}</td>
                  <td>{r.fuente}</td>
                  <td>{r.observaciones}</td>
                  <td>
                    <button onClick={() => alternarActivo(r)}>
                      {r.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button className="danger" onClick={() => borrar(r)}>
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}

              {!reportes.length && (
                <tr><td colSpan="11" className="mini">Sin reportes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function csvCell(v) {
  v = String(v ?? "");
  return `"${v.replace(/"/g, '""')}"`;
}
