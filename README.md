# 🌟 EGS Ecosystem (UI, FX & Back)

> **A sleek, zero-dependency, full-stack web toolkit** engineered for modern portfolios, 3D showcases, and high-performance web applications.

---

## 📦 Overview

**EGS** is a lightweight, modular ecosystem designed for developers, 3D artists, and creators who want stunning visual aesthetics and seamless backend utilities without the bloat of traditional heavyweight frameworks. 

The ecosystem consists of three core modules:
1. **`EGS UI`** — A modern CSS styling system featuring a 12-column grid, Dark/Light modes, Glassmorphism, Glow effects, and clean UI components.
2. **`EGS FX`** — A zero-dependency ES6 WebGL engine delivering smooth background shaders (*Liquid Metal, Glass Caustics, Hologram, Fire*, etc.) and custom cursor interactions[cite: 4].
3. **`EGS Back`** — A secure, ready-to-use Express.js micro-backend providing full CRUD REST APIs for SQLite databases, CSV, and Excel files.

---

## 📂 Project Structure

```text
📁 Project_suggest/
├── 📄 index.html
├── 📁 css/
│   ├── 📄 main.css
│   └── 📄 egs_ui.min.css        # Modern styling system (Glass, Glow, Grid)[cite: 1, 2]
├── 📁 js/
│   ├── 📜 egs_fx.min.js         # WebGL Visual Effects & Custom Cursor Engine[cite: 4]
│   ├── 📜 egs_back.min.js    # Express.js REST API server
│   └── 📜 fileHandler.js    # CSV & Excel data handlers[cite: 1, 3]
├── 📁 data/
│   ├── 📄 datebase.sqlite   # SQLite database[cite: 1]
│   ├── 📄 datebase.csv      # CSV storage[cite: 1]
│   └── 📄 datebase.xlsx     # Excel storage[cite: 1]
└── 📄 README.md
```
---

##🚀 Quick Start & Installation
###1. Frontend Setup (EGS UI & EGS FX)
Include the stylesheet in your HTML <head> and import the FX module in your JavaScript:
```html
<!-- Include EGS UI Styling -->
<link rel="stylesheet" href="./css/egs_ui.css">

<!-- Container for WebGL Effect -->
<div id="hero-fx-container" style="width: 100vh; height: 500px;"></div>

<!-- Initialize EGS FX -->
<script type="module">
  import { egs_fx } from './js/egs_fx.js';
  
  // Initialize WebGL background effect
  const fx = new egs_fx('hero-fx-container', 'liquid-metal', {
    speed: 1.0,
    intensity: 1.0,
    color: '#2563eb',
    customCursor: true
  });
</script>
```
---

###2. Backend Setup (EGS Back)
Navigate to your backend directory and install the required dependencies:
```cmd
npm install express cors helmet express-rate-limit sqlite3 xlsx csv-parser
```
Run the server:
```cmd
node js/egs_backmin.js
```
The server will start securely at http://localhost:3000 with built-in rate-limiting and CORS support.

---

##🎛️ Features & Modules
###🎨 EGS UI (egs_ui.css)
1. Responsive 12-Column Grid: Built for modern fluid layouts.
2. Glassmorphism & Glow: Pre-built classes like .card_glass, .nav_glass, and .btn_glow.
3. Theme Switching: Native support for light mode and .dark-mode overrides[cite: 2].

---

###✨ EGS FX (egs_fx.js)Supported shader effects out of the box:
* ***liquid-metal***
* ***glass-caustics***
* ***hologram***
* ***fire / smoke / sparks***

---

###🛠️ EGS Back (egs_backmin.js)
Provides clean REST endpoints for rapid prototyping:
* CSV
```
GET /api/csv / POST /api/csv / PUT /api/csv/:id / DELETE /api/csv/:id
```
* Excel
```
GET /api/excel / POST /api/excel / PUT /api/excel/:id / DELETE /api/excel/:id
```
* SQL
```
GET /api/sql / POST /api/sql / PUT /api/sql/:id / DELETE /api/sql/:id[cite: 3]
```

---
<p align="left">
  <a href="https://github.com/egssnguyen/EGS_ecosystem/blob/main/Manual_Details.md">
    <img src="https://img.shields.io/badge/Manual-Documentation-blue?style=for-the-badge&logo=gitbook&logoColor=white" alt="Manual Documentation">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
  </a>
</p>
