// backend/server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 4000;

// Archivos "base de datos"
const REPORTS_FILE = path.join(__dirname, "data", "reports.json");
const USERS_FILE = path.join(__dirname, "data", "users.json");

// Carpeta del frontend
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

// Middlewares
app.use(cors());
app.use(express.json());

// Servir frontend
app.use(express.static(FRONTEND_DIR));

/* ---------- HELPERS ---------- */

function leerJSON(ruta) {
  try {
    const data = fs.readFileSync(ruta, "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error al leer", ruta, error);
    return [];
  }
}

function guardarJSON(ruta, contenido) {
  try {
    fs.writeFileSync(ruta, JSON.stringify(contenido, null, 2), "utf8");
  } catch (error) {
    console.error("Error al escribir", ruta, error);
  }
}

function leerReportes() {
  return leerJSON(REPORTS_FILE);
}

function guardarReportes(reportes) {
  guardarJSON(REPORTS_FILE, reportes);
}

function leerUsuarios() {
  return leerJSON(USERS_FILE);
}

function guardarUsuarios(usuarios) {
  guardarJSON(USERS_FILE, usuarios);
}

/* ---------- API REPORTES ---------- */

app.get("/api/reports", (req, res) => {
  const reportes = leerReportes();
  res.json(reportes);
});

app.post("/api/reports", (req, res) => {
  const { linea, tipo, estacion, descripcion, email } = req.body;

  if (!linea || !tipo || !descripcion) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: linea, tipo, descripcion" });
  }

  const opcionesTipo = {
    atraso: "Tren detenido / grandes atrasos",
    afluencia: "Aglomeración inusual",
    tecnico: "Falla técnica",
    seguridad: "Seguridad",
    otro: "Otro"
  };

  const nuevoReporte = {
    id: Date.now(),
    linea,
    tipo,
    tipoTexto: opcionesTipo[tipo] || tipo,
    estacion: estacion || null,
    descripcion,
    email: email || null,
    createdAt: new Date().toISOString()
  };

  const reportes = leerReportes();
  reportes.push(nuevoReporte);
  guardarReportes(reportes);

  res.status(201).json(nuevoReporte);
});

app.get("/api/reports/latest", (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const reportes = leerReportes()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
  res.json(reportes);
});

/* ---------- API USUARIOS ---------- */

app.post("/api/users/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: name, email, password" });
  }

  const usuarios = leerUsuarios();
  const yaExiste = usuarios.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (yaExiste) {
    return res.status(409).json({ error: "Ya existe un usuario con ese correo" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const nuevoUsuario = {
    id: Date.now(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  const { passwordHash: _, ...usuarioRespuesta } = nuevoUsuario;
  res.status(201).json(usuarioRespuesta);
});

app.post("/api/users/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: email, password" });
  }

  const usuarios = leerUsuarios();
  const usuario = usuarios.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!usuario) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const ok = bcrypt.compareSync(password, usuario.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const { passwordHash: _, ...usuarioRespuesta } = usuario;
  res.json(usuarioRespuesta);
});

app.get("/api/users", (req, res) => {
  const usuarios = leerUsuarios().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt
  }));
  res.json(usuarios);
});

/* ---------- ARRANCAR SERVIDOR ---------- */

app.listen(PORT, () => {
  console.log(`metroSOS backend escuchando en http://localhost:${PORT}`);
});
