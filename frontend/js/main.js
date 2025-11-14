document.addEventListener("DOMContentLoaded", () => {
  const detailsButtons = document.querySelectorAll("button[data-line]");
  const modal = document.getElementById("detailsModal");
  const modalBody = document.getElementById("modalBody");
  const closeElements = modal.querySelectorAll("[data-close-modal]");
  const lastUpdateElement = document.getElementById("lastUpdate");

  let estadosLineas = {};

  function formatearFecha(isoString) {
    if (!isoString) return null;
    const fecha = new Date(isoString);
    if (Number.isNaN(fecha.getTime())) return null;

    return fecha.toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short"
    });
  }

  async function cargarEstadoLineas() {
    try {
      const respuesta = await fetch("data/line-status.json?ts=" + Date.now(), {
        cache: "no-store"
      });
      const data = await respuesta.json();

      // actualizar texto "Última actualización"
      if (lastUpdateElement) {
        const texto =
          data.lastUpdateText ||
          (data.lastUpdate ? formatearFecha(data.lastUpdate) : null);

        if (texto) {
          lastUpdateElement.textContent = "Última actualización: " + texto;
        }
      }

      estadosLineas = {};
      data.lines.forEach((linea) => {
        estadosLineas[linea.id] = linea;

        const card = document.querySelector(
          `.line-card[data-line="${linea.id}"]`
        );
        if (!card) return;

        const badge = card.querySelector("[data-status-badge]");
        const statusText = card.querySelector("[data-status-text]");

        if (badge) {
          badge.textContent = linea.label || "";
          badge.classList.remove(
            "badge--active",
            "badge--warning",
            "badge--stopped"
          );

          if (linea.badgeType === "active") badge.classList.add("badge--active");
          if (linea.badgeType === "warning")
            badge.classList.add("badge--warning");
          if (linea.badgeType === "stopped")
            badge.classList.add("badge--stopped");
        }

        if (statusText) {
          statusText.innerHTML = linea.shortText || "";
        }
      });

      console.log("Estado de líneas actualizado:", data.lastUpdate || "");
    } catch (error) {
      console.error("Error al cargar estado de líneas:", error);
    }
  }

  // Modal detalles
  detailsButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lineId = btn.getAttribute("data-line");
      const dataLinea = estadosLineas[lineId];

      modalBody.textContent =
        (dataLinea && dataLinea.details) ||
        "Información no disponible para esta línea.";
      modal.classList.add("is-visible");
      modal.setAttribute("aria-hidden", "false");
    });
  });

  closeElements.forEach((el) => {
    el.addEventListener("click", () => {
      modal.classList.remove("is-visible");
      modal.setAttribute("aria-hidden", "true");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-visible")) {
      modal.classList.remove("is-visible");
      modal.setAttribute("aria-hidden", "true");
    }
  });

  cargarEstadoLineas();
  setInterval(cargarEstadoLineas, 15000);
});
