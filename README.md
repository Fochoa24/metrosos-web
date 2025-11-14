# MetroSOS WebApp

MetroSOS es una aplicación web en etapa de **Producto Mínimo Viable (MVP)** que busca apoyar a las personas usuarias del **Metro de Santiago** mediante la **reporte de incidentes** en tiempo casi real y la visualización del **estado operativo de las líneas 1 a 6**.  

El proyecto se desarrolla en el contexto de una asignatura universitaria de ingeniería informática y tiene como propósito aplicar conceptos de desarrollo web full stack, diseño de interfaces y diseño de APIs REST con persistencia básica de datos.

> **Nota:** MetroSOS es un proyecto académico y no corresponde a una aplicación oficial ni está afiliada al Metro de Santiago.

---

## 1. Objetivos del proyecto

### 1.1 Objetivo general

Desarrollar un **MVP de aplicación web** que permita a las personas usuarias reportar incidentes en el Metro de Santiago y consultar, de forma simple y rápida, el estado de las principales líneas del sistema de transporte.

### 1.2 Objetivos específicos

- Implementar una **interfaz web** que muestre el estado de las líneas del metro y permita registrar incidentes.
- Diseñar y construir un **backend en Node.js/Express** que exponga una API REST para gestionar reportes.
- Incorporar un mecanismo de **persistencia ligera** de datos basado en archivos JSON, adecuado para un prototipo académico.
- Estructurar el código y la arquitectura de forma que el proyecto resulte **escalable y extensible** hacia futuras mejoras (base de datos real, autenticación, dashboards, etc.).

---

## 2. Alcance funcional

Actualmente, el MVP ofrece las siguientes funcionalidades:

- **Visualización del estado de las líneas 1 a 6** del Metro de Santiago, mediante tarjetas informativas y detalles en un modal.
- **Registro de incidentes** relacionados con:
  - Atrasos o detenciones de trenes.
  - Aglomeraciones o alta demanda.
  - Fallas técnicas.
  - Situaciones de seguridad o convivencia.
  - Otros eventos relevantes.
- **Listado de reportes almacenados** en el servidor (histórico básico).
- **Mapa referencial de la red de metro**, como apoyo visual.
- Sección inicial de **“Mi cuenta”** destinada a futuras extensiones (autenticación, perfil de usuario, etc.).

---

## 3. Arquitectura del sistema

La estructura general del repositorio sigue una separación lógica entre frontend y backend:

```txt
metrosos-webapp/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── data/
│       └── reports.json
└── frontend/
    ├── index.html
    ├── report.html
    ├── map.html
    ├── account.html
    ├── css/
    │   └── styles.css
    ├── js/
    │   ├── main.js
    │   └── report.js
    └── data/
        └── line-status.json
