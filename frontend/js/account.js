// js/account.js
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:4000";

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const sessionInfo = document.getElementById("sessionInfo");

  const STORAGE_USER_KEY = "metrosos_user";

  function obtenerUsuarioActual() {
    try {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function guardarUsuarioActual(user) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  }

  function cerrarSesion() {
    localStorage.removeItem(STORAGE_USER_KEY);
    renderSessionInfo();
  }

  function renderSessionInfo() {
    const user = obtenerUsuarioActual();
    sessionInfo.innerHTML = "";

    if (!user) {
      const p = document.createElement("p");
      p.className = "report-list__empty";
      p.textContent = "No hay sesión iniciada.";
      sessionInfo.appendChild(p);
      return;
    }

    const card = document.createElement("article");
    card.className = "line-card report-card";

    const header = document.createElement("div");
    header.className = "report-card__header";

    const title = document.createElement("h3");
    title.className = "line-card__title";
    title.textContent = `Sesión iniciada como ${user.name}`;

    const meta = document.createElement("span");
    meta.className = "report-card__meta";
    meta.textContent = user.email;

    header.appendChild(title);
    header.appendChild(meta);

    const body = document.createElement("p");
    body.className = "line-card__status-text";
    body.textContent =
      "En futuras versiones, tus reportes podrían vincularse a tu cuenta.";

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "btn btn--outline";
    logoutBtn.textContent = "Cerrar sesión";
    logoutBtn.addEventListener("click", cerrarSesion);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(logoutBtn);

    sessionInfo.appendChild(card);
  }

  async function registrarUsuario(payload) {
    const res = await fetch(`${API_BASE}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.error || res.statusText || "Error de registro";
      throw new Error(msg);
    }

    return data;
  }

  async function loginUsuario(payload) {
    const res = await fetch(`${API_BASE}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.error || res.statusText || "Error al iniciar sesión";
      throw new Error(msg);
    }

    return data;
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(registerForm);
      const name = formData.get("name").toString().trim();
      const email = formData.get("email").toString().trim();
      const password = formData.get("password").toString().trim();

      if (!name || !email || !password) {
        alert("Completa nombre, correo y contraseña.");
        return;
      }

      try {
        const user = await registrarUsuario({ name, email, password });
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        const loginEmail = document.getElementById("login-email");
        if (loginEmail) loginEmail.value = user.email || email;
        registerForm.reset();
      } catch (error) {
        console.error(error);
        alert("Error al registrar usuario: " + error.message);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const email = formData.get("email").toString().trim();
      const password = formData.get("password").toString().trim();

      if (!email || !password) {
        alert("Completa correo y contraseña.");
        return;
      }

      try {
        const user = await loginUsuario({ email, password });
        guardarUsuarioActual(user);
        renderSessionInfo();
        alert("Sesión iniciada correctamente ✅");
        loginForm.reset();
      } catch (error) {
        console.error(error);
        alert("No se pudo iniciar sesión: " + error.message);
      }
    });
  }

  renderSessionInfo();
});
