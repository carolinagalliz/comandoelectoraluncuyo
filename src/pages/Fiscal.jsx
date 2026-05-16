import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, serverTimestamp } from "../firebase.js";

const FACULTADES = [
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

const CLAUSTROS = ["Docentes", "Estudiantes", "Egresados", "No docentes"];

const inicial = {
  facultad: "Derecho",
  claustro: "Docentes",
  mesa: "",
  ismael: "",
  oposicion: "",
  blancos: "",
  confianza: "media",
  fuente: "",
  observaciones: "",
};

export default function Fiscal() {
  const [form, setForm] = useState(inicial);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState("");

  function setCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();

    const ismael = Number(form.ismael || 0);
    const oposicion = Number(form.oposicion || 0);
    const blancos = Number(form.blancos || 0);

    if (ismael + oposicion + blancos <= 0) {
      alert("Cargá al menos un voto.");
      return;
    }

    setEnviando(true);
    setOk("");

    try {
      await addDoc(collection(db, "boca_urna_reportes"), {
        ...form,
        ismael,
        oposicion,
        blancos,
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
        activo: true,
      });

      setOk("Reporte enviado correctamente.");
      setForm({ ...inicial, facultad: form.facultad, claustro: form.claustro });
    } catch (error) {
      console.error(error);
      alert("No se pudo enviar el reporte. Revisá Firebase.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main>
      <section className="panel">
        <h2>Carga rápida de fiscal</h2>
        <p className="mini">
          Esta pantalla es para celular. Cada envío entra en vivo al comando.
        </p>

        <form onSubmit={guardar}>
          <div className="grid">
            <div>
              <label>Unidad académica</label>
              <select value={form.facultad} onChange={(e) => setCampo("facultad", e.target.value)}>
                {FACULTADES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label>Claustro</label>
              <select value={form.claustro} onChange={(e) => setCampo("claustro", e.target.value)}>
                {CLAUSTROS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label>Mesa</label>
              <input value={form.mesa} onChange={(e) => setCampo("mesa", e.target.value)} placeholder="Ej: Mesa 12" />
            </div>

            <div>
              <label>Votos Ismael</label>
              <input type="number" min="0" value={form.ismael} onChange={(e) => setCampo("ismael", e.target.value)} />
            </div>

            <div>
              <label>Votos oposición</label>
              <input type="number" min="0" value={form.oposicion} onChange={(e) => setCampo("oposicion", e.target.value)} />
            </div>

            <div>
              <label>Blancos / nulos</label>
              <input type="number" min="0" value={form.blancos} onChange={(e) => setCampo("blancos", e.target.value)} />
            </div>
          </div>

          <div className="grid-3">
            <div>
              <label>Confianza</label>
              <select value={form.confianza} onChange={(e) => setCampo("confianza", e.target.value)}>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div>
              <label>Fuente</label>
              <input value={form.fuente} onChange={(e) => setCampo("fuente", e.target.value)} placeholder="Fiscal / referente" />
            </div>

            <div>
              <label>Observaciones</label>
              <input value={form.observaciones} onChange={(e) => setCampo("observaciones", e.target.value)} placeholder="Incidencias, clima..." />
            </div>
          </div>

          <div className="btns">
            <button className="primary" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar reporte"}
            </button>
          </div>

          {ok && <div className="success">{ok}</div>}
        </form>
      </section>
    </main>
  );
}
