# Frontend - Fast API Recetario

Cliente web desarrollado con **HTML5, CSS3 y JavaScript Vanilla** que consume la API REST de Recetas y Categorías. Su objetivo es servir como **portal de documentación** y como **demostración interactiva** de las operaciones CRUD, filtros, búsqueda y paginación que ofrece el backend.

> ⚠️ Este README describe exclusivamente el frontend. El backend (FastAPI + base de datos relacional) se documenta por separado.

---

## 🛠 Tecnologías

- **HTML5** semántico
- **CSS3** (Flexbox, Grid, variables CSS, Mobile First)
- **JavaScript Vanilla** (ES6+: módulos, async/await, fetch/Axios)
- **Axios** para peticiones HTTP asíncronas
- **Google Fonts** / iconos SVG para la identidad visual
- **Live Server** o cualquier servidor estático para desarrollo

---

## 📁 Estructura del proyecto

```text
frontend/
├── index.html              # Landing + documentación de la API
├── app.html                # Panel CRUD interactivo
├── docs.html               # Tabla detallada de endpoints
├── css/
│   ├── styles.css          # Estilos globales y variables
│   └── responsive.css      # Media queries (Mobile First)
├── js/
│   ├── api.js              # Instancia Axios, interceptores y errores
│   ├── recetas.js          # Lógica CRUD de recetas
│   ├── categorias.js       # Lógica CRUD de categorías
│   └── ui.js               # Toasts, loaders, modales y render
└── assets/
    ├── img/                # Ilustraciones e iconos
    └── fonts/              # Tipografías locales (opcional)
