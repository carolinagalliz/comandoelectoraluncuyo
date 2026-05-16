export function pesoConfianza(valor) {
  if (valor === "alta") return 1;
  if (valor === "media") return 0.75;
  return 0.45;
}

export function pesoClaustro(claustro) {
  // Ajustable cuando definan la ponderación política real.
  if (claustro === "Docentes") return 1.25;
  if (claustro === "No docentes") return 1.1;
  if (claustro === "Egresados") return 0.85;
  if (claustro === "Estudiantes") return 0.8;
  return 1;
}

export function calcularProyeccion(reportes = []) {
  let ismaelP = 0;
  let oposicionP = 0;
  let blancosP = 0;
  let votosBrutos = 0;
  let confianzaAcum = 0;

  const porFacultad = {};
  const porClaustro = {};

  reportes.forEach((r) => {
    const confianza = pesoConfianza(r.confianza);
    const claustroPeso = pesoClaustro(r.claustro);
    const factor = confianza * claustroPeso;

    const ismael = Number(r.ismael || 0);
    const oposicion = Number(r.oposicion || 0);
    const blancos = Number(r.blancos || 0);

    ismaelP += ismael * factor;
    oposicionP += oposicion * factor;
    blancosP += blancos * factor;
    votosBrutos += ismael + oposicion + blancos;
    confianzaAcum += confianza;

    const unidad = r.facultad || "Sin unidad";
    const claustro = r.claustro || "Sin claustro";

    if (!porFacultad[unidad]) {
      porFacultad[unidad] = { reportes: 0, ismael: 0, oposicion: 0, blancos: 0, total: 0 };
    }

    if (!porClaustro[claustro]) {
      porClaustro[claustro] = { reportes: 0, ismael: 0, oposicion: 0, blancos: 0, total: 0 };
    }

    [porFacultad[unidad], porClaustro[claustro]].forEach((bucket) => {
      bucket.reportes++;
      bucket.ismael += ismael;
      bucket.oposicion += oposicion;
      bucket.blancos += blancos;
      bucket.total += ismael + oposicion + blancos;
    });
  });

  const totalP = ismaelP + oposicionP + blancosP;
  const porcentajeIsmael = totalP ? (ismaelP / totalP) * 100 : 0;
  const margen = totalP ? ((ismaelP - oposicionP) / totalP) * 100 : 0;

  let probabilidad = 0;

  if (totalP) {
    const confianzaMuestra = Math.min(
      100,
      Math.round((confianzaAcum / Math.max(reportes.length, 1)) * 100)
    );

    const premioMuestra = Math.min(10, reportes.length * 1.2);

    probabilidad = Math.round(
      50 + margen * 1.7 + premioMuestra + (confianzaMuestra - 70) * 0.08
    );

    probabilidad = Math.max(0, Math.min(100, probabilidad));
  }

  const confianzaPromedio = reportes.length
    ? Math.round((confianzaAcum / reportes.length) * 100)
    : 0;

  return {
    ismaelP,
    oposicionP,
    blancosP,
    votosBrutos,
    porcentajeIsmael,
    margen,
    probabilidad,
    confianzaPromedio,
    porFacultad,
    porClaustro,
  };
}

export function estadoPorcentaje(pct) {
  if (pct >= 55) return { texto: "Favorable", clase: "ok" };
  if (pct >= 48) return { texto: "Disputada", clase: "warn" };
  return { texto: "Crítica", clase: "bad" };
}
