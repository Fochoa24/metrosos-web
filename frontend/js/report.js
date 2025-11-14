// js/report.js
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:4000";

  const form = document.getElementById("reportForm");
  const reportList = document.getElementById("reportList");

  if (!form || !reportList) return;

  function formatearFecha(isoString) {
    const fecha = new Date(isoString);
    if (Number.isNaN(fecha.getTime())) return "";
    return fecha.toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short"
    });
  }

  async function obtenerReportes() {
    const res = await fetch(`${API_BASE}/api/reports`);
    if (!res.ok) {
      throw new Error("Error al obtener reportes: " + res.status);
    }
    return await res.json();
  }

  async function crearReporte(payload) {
    const res = await fetch(`${API_BASE}/api/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const errorText = await res.text().catch(() => "");

    if (!res.ok) {
      throw new Error(
        `Error al crear reporte (${res.status}): ${
          errorText || res.statusText
        }`
      );
    }

    return JSON.parse(errorText || "{}");
  }

  async function renderReportes() {
    reportList.innerHTML = "";

    let reportes;
    try {
      reportes = await obtenerReportes();
    } catch (error) {
      console.error(error);
      const p = document.createElement("p");
      p.className = "report-list__empty";
      p.textContent =
        "No se pudieron cargar los reportes desde el servidor.";
      reportList.appendChild(p);
      return;
    }

    if (!reportes.length) {
      const p = document.createElement("p");
      p.className = "report-list__empty";
      p.textContent = "No hay reportes guardados todavía.";
      reportList.appendChild(p);
      return;
    }

    reportes
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((reporte) => {
        const card = document.createElement("article");
        card.className = "line-card report-card";

        const header = document.createElement("div");
        header.className = "report-card__header";

        const title = document.createElement("h3");
        title.className = "line-card__title";
        title.textContent = `Línea ${reporte.linea} – ${
          reporte.tipoTexto || reporte.tipo
        }`;

        const meta = document.createElement("span");
        meta.className = "report-card__meta";
        meta.textContent = formatearFecha(reporte.createdAt);

        header.appendChild(title);
        header.appendChild(meta);

        const body = document.createElement("p");
        body.className = "line-card__status-text";
        const estacionTxt = reporte.estacion
          ? `Estación: ${reporte.estacion}. `
          : "";
        body.textContent = `${estacionTxt}${reporte.descripcion}`;

        card.appendChild(header);
        card.appendChild(body);

        if (reporte.email) {
          const emailP = document.createElement("p");
          emailP.className = "report-card__meta";
          emailP.textContent = `Contacto: ${reporte.email}`;
          card.appendChild(emailP);
        }

        reportList.appendChild(card);
      });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const linea = formData.get("linea");
    const tipo = formData.get("tipo");
    const estacion = (formData.get("estacion") || "").toString().trim();
    const descripcion = (formData.get("descripcion") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();

    if (!linea || !tipo || !descripcion) {
      alert("Por favor completa al menos línea, tipo de incidente y descripción.");
      return;
    }

    const payload = {
      linea,
      tipo,
      estacion: estacion || null,
      descripcion,
      email: email || null
    };

    try {
      await crearReporte(payload);
      form.reset();
      await renderReportes();
      alert("Reporte enviado y guardado en el servidor ✅");
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al enviar el reporte. Revisa la consola.");
    }
  });

  renderReportes();
});
