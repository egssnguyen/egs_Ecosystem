# 📖 EGS Ecosystem — Official User Manual

> **Version:** 3.5.0 (2026-2027 Full Edition)
> **Author:** Egss Nguyễn
> **License:** MIT

---

## 📋 Table of Contents

1. [Introduction](https://www.google.com/search?q=%231-introduction)
2. [EGS UI (Styling System)](https://www.google.com/search?q=%232-egs-ui-styling-system)
3. [EGS FX (WebGL Shaders Engine)](https://www.google.com/search?q=%233-egs-fx-webgl-shaders-engine)
4. [EGS Back (Micro Backend Server)](https://www.google.com/search?q=%234-egs-back-micro-backend-server)
5. [Complete Integration Example](https://www.google.com/search?q=%235-complete-integration-example)

---

## 1. Introduction

The **EGS Ecosystem** is a sleek, zero-dependency, full-stack web toolkit engineered for modern portfolios, 3D artist showcases, and high-performance interactive web applications[cite: 4]. It bridges the gap between stunning aesthetic design, real-time WebGL background effects, and lightweight data management.

---

## 2. EGS UI (Styling System)

`egs_ui.css` provides a modern, responsive layout framework with built-in support for **Glassmorphism**, **Glow effects**, a **12-column grid system**, and **Dark/Light theme switching**[cite: 2].

### Installation

Include the stylesheet inside the `<head>` of your HTML document:

```html
<link rel="stylesheet" href="./css/egs_ui.css">

```

### Core Components & Classes

#### A. Glassmorphism Cards & Containers

To create sleek, semi-transparent frosted glass elements:

```html
<!-- Standard Glass Card -->
<div class="card_glass">
    <div class="card-header">Card Header</div>
    <div class="card-body">
        <p>This is a frosted glass container with a backdrop blur filter.</p>
    </div>
</div>

<!-- Glow Card (Neon Accent Border) -->
<div class="card_glow">
    <div class="card-body">
        <p>This card features a primary neon glow shadow.</p>
    </div>
</div>

```

#### B. Navigation Bar (`nav_glass` / `nav_glow`)

```html
<nav class="nav_glass">
    <a href="#" class="nav-brand">EGS Project</a>
    <ul class="nav-items">
        <li><a href="#" class="nav-link">Home</a></li>
        <li><a href="#" class="nav-link">Showcase</a></li>
        <li><a href="#" class="nav-link">Contact</a></li>
    </ul>
</nav>

```

#### C. Buttons (`btn_glass`, `btn_glow`, `btn_par`)

```html
<button class="btn">Default Primary</button>
<button class="btn_glass">Glass Button</button>
<button class="btn_glow">Neon Glow Button</button>
<button class="btn_par">Parallax Gradient Button</button>

```

#### D. Theme Toggle (Dark / Light Mode)

EGS UI handles themes via standard body classes:

```html
<!-- Switch to Dark Mode -->
<body class="dark-mode">
    <!-- Content automatically adapts to dark surface variables -->
</body>

```

---

## 3. EGS FX (WebGL Shaders Engine)

`egs_fx.js` is a zero-dependency ES6 module designed to render high-performance WebGL background shaders and custom interactive cursors[cite: 4].

### Initialization Guide

1. Create a container element in your HTML:
```html
<div id="webgl-background" style="width: 100%; height: 100vh; position: fixed; top: 0; left: 0; z-index: -1;"></div>

```


2. Import and initialize the module via JavaScript[cite: 4]:
```html
<script type="module">
    import { egs_fx } from './js/egs_fx.js';

    const fxEngine = new egs_fx('webgl-background', 'liquid-metal', {
        speed: 1.0,           // Animation speed multiplier
        intensity: 1.0,       // Effect brightness / intensity
        color: '#00ffcc',     // Primary Hex color code
        mouseInteractive: true, // Reacts to mouse pointer movement
        customCursor: true    // Enables EGS custom animated cursor[cite: 4]
    });
</script>

```



### Available Shader Effects (`effectType`)

Pass any of the following strings as the second parameter when instantiating `egs_fx`:

| Effect Name (`type`) | Visual Description |
| --- | --- |
| `'liquid-metal'` *(Default)* | Flowing metallic liquid waves reacting dynamically to mouse input. |
| `'glass-caustics'` | Refractive light patterns simulating light passing through glass or water. |
| `'liquid'` | Real-time ripple wave distortions across the canvas. |
| `'smoke'` | Organic vertical smoke simulation with noise displacement. |
| `'fire'` | Stylized flame shader effect with upward particle motion. |
| `'hologram'` | Cyberpunk scanlines and digital glitch patterns. |
| `'sparks'` | Floating dynamic particle sparks ascending in space. |

---

## 4. EGS Back (Micro Backend Server)

`egs_backmin.js` provides a lightweight Node.js/Express REST API server equipped with Helmet security, CORS, and Rate Limiting[cite: 3].

### Setup & Execution

1. Navigate to your backend directory and install dependencies:
```bash
npm install express cors helmet express-rate-limit sqlite3 xlsx csv-parser

```


2. Run the server:
```bash
node js/egs_backmin.js

```


*The server starts securely at `http://localhost:3000`[cite: 3].*

### API Endpoints Reference

* **CSV Operations:** `GET /api/csv` | `POST /api/csv` | `PUT /api/csv/:id` | `DELETE /api/csv/:id`[cite: 3]
* **Excel Operations:** `GET /api/excel` | `POST /api/excel` | `PUT /api/excel/:id` | `DELETE /api/excel/:id`[cite: 3]
* **SQLite Database:** `GET /api/sql` | `POST /api/sql` | `PUT /api/sql/:id` | `DELETE /api/sql/:id`[cite: 3]

---

## 5. Complete Integration Example

Here is a full HTML template combining **EGS UI** and **EGS FX**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EGS Showcase</title>
    <!-- 1. Include EGS UI CSS -->
    <link rel="stylesheet" href="./css/egs_ui.css">
</head>
<body class="dark-mode">

    <!-- WebGL Background Container -->
    <div id="fx-canvas-container" style="width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; z-index: -1;"></div>

    <!-- UI Navigation -->
    <nav class="nav_glass">
        <a href="#" class="nav-brand">EgsEngine</a>
        <ul class="nav-items">
            <li><a href="#" class="nav-link">Documentation</a></li>
            <li><a href="#" class="nav-link">Shaders</a></li>
        </ul>
    </nav>

    <!-- Main Content -->
    <main class="container" style="padding-top: 4rem;">
        <div class="card_glass" style="max-width: 600px; margin: 0 auto;">
            <div class="card-header">Welcome to EGS Ecosystem</div>
            <div class="card-body">
                <p>Experience lightning-fast UI styling combined with immersive WebGL background shaders[cite: 2, 4].</p>
                <button class="btn_glow" style="margin-top: 1rem;">Explore Shaders</button>
            </div>
        </div>
    </main>

    <!-- 2. Initialize EGS FX Module -->
    <script type="module">
        import { egs_fx } from './js/egs_fx.js';
        
        new egs_fx('fx-canvas-container', 'liquid-metal', {
            speed: 1.2,
            intensity: 0.9,
            color: '#2563eb',
            customCursor: true
        });
    </script>
</body>
</html>

```

---

## ❓ Frequently Asked Questions (FAQ)
* **Q: Is EGS dependent on jQuery or heavy frameworks?**
  * A: No, EGS is 100% zero-dependency, utilizing pure CSS and vanilla ES6 JavaScript modules.
* **Q: Can I use Egs FX background shaders without Egs UI?**
  * A: Yes, all three modules (`EGS UI`, `EGS FX`, and `EGS Back`) are fully modular and can be used independently.
