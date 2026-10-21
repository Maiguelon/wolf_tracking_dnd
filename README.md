# 🐺 Wolf Companion — D&D 5e Evolution Tracker

Aplicación web interactiva para gestionar el árbol de evolución y estadísticas de compañeros lobo en **Dungeons & Dragons 5e**, basada en el sistema oficial de la hoja *"Wolf Pet Skill Tree"*.

Diseñada para resolver la sobrecarga de opciones del jugador en mesa física: en lugar de lidiar con hojas de papel llenas de tachaduras, el jugador ve en una pestaña su lobo actual y en otra **únicamente las mejoras inmediatas disponibles**, con opción de swipe táctil y vista panorámica del árbol para planificar a futuro.

---

## 🌟 Características Principales

* **Ficha de Lobo en Tiempo Real (Pestaña "Lobo Actual"):**
  * Estadísticas de combate: Clase de Armadura (CA 11 a 19), Puntos de Golpe (PG 5 a 45), Velocidad (30 a 60 pies) y Salto (20 a 40 pies).
  * Daño adicional por Mordisco (+1d6, +2d6, +3d6).
  * **Tiradas de Salvación y Comida Especial:** Contador de 5 casillas visuales por atributo (FUE, DES, CON, INT, SAB, CAR) alimentables con comida especial (+1 permanente cada una).
  * Lista clasificada de **Comandos de Acción Adicional** (Carrera, Esquiva, Destrabarse, Empuje, Agarre, etc.).
  * Habilidades de uso diario/semanal (Incansable, Causar Miedo, Rastreador, Revivir, etc.) y pasivas.
  * Selector de nivel (progreso de 20 casillas de puntos de habilidad).

* **Mejoras Inmediatas (Pestaña "Mejoras"):**
  * Filtro inteligente: solo muestra lo que el jugador puede desbloquear ahora mismo según sus prerrequisitos (evita parálisis por análisis).
  * **Navegación por Swipe / Botones** entre las 4 ramas:
    * ⚔️ **Combate (Combat)**
    * 🍃 **Movilidad (Mobility)**
    * 🧭 **Rastreo (Tracking)**
    * 🤝 **Soporte Emocional (Emotional Support)**
  * Celebración con confeti al aprender una nueva habilidad.

* **Modal "Ver Árbol Completo":**
  * Visualización completa de todas las ramas, nodos desbloqueados, disponibles y bloqueados.
  * Seguimiento de las habilidades **Apex** (requieren 10 puntos en la rama).

* **Banco de Avatares / Galería:**
  * 8 retratos en alta definición:
    * Fotografías reales (Lobo Gris, Blanco Ártico, Timber Wolf, Aullador Nocturno).
    * Estilos artísticos (Óleo Fantasía Épico, Acuarela Feérica, Anime/Cómic Cel-shaded).
    * **Easter Egg:** 1 retrato cómico de un humano vestido de lobo ("Furro Legítimo").

* **Panel Exclusivo del Dungeon Master (DM):**
  * Acceso mediante botón o enlace con parámetro `?role=dm`.
  * Otorgar / deducir Puntos de Habilidad (1 semana de descanso + 100 po = 1 punto).
  * Suministro de raciones de Comida Especial.
  * **Reasignación de Puntos (Respec):** Botón para reiniciar habilidades si el jugador se equivocó, devolviendo todos los puntos a la reserva sin perder las comidas especiales.
  * Inspección en vivo de la build elegida por el jugador.
  * Enlaces rápidos de 1 clic para compartir ("Link para Jugador" y "Link para DM").

* **Soporte Multi-Lobo:**
  * Selector en barra superior para gestionar 1 o más lobos en la misma campaña o para distintos jugadores.

* **Sincronización:**
  * Sincronización instantánea entre pestañas/ventanas con `BroadcastChannel` y `localStorage`.
  * Arquitectura lista para conectar con Supabase o Cloudflare D1 si se desea sincronización remota entre dispositivos.

---

## 🚀 Despliegue en Cloudflare Workers

El servicio existente se llama **`wolf-tracking-dnd`** y está conectado al repositorio `Maiguelon/wolf_tracking_dnd`, rama `main`.

### Despliegue desde GitHub

En **Workers & Pages → wolf-tracking-dnd → Settings → Build**, usa:

* **Root directory:** `/` (raíz del repositorio).
* **Build command:** `npm run build`.
* **Deploy command:** `npx wrangler deploy`.
* **Production branch:** `main`.
* No se necesitan variables de entorno para esta aplicación.

Sube los cambios a `main` para iniciar un despliegue automático. Para reintentar un despliegue desde Cloudflare, abre **Deployments → Build history → View build → Retry build**.

`wrangler.jsonc` indica el nombre del servicio, la carpeta de archivos compilados (`dist`) y el modo `single-page-application`, que sirve `index.html` al abrir rutas de la aplicación directamente.

### Despliegue manual desde la computadora

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
npm ci
npx wrangler login
npm run deploy
```

El inicio de sesión abre el navegador; elige la cuenta donde está `wolf-tracking-dnd`. Solo hace falta iniciar sesión si no tienes una sesión válida. `npm run deploy` compila la versión local y después la publica en ese mismo servicio. Wrangler está incluido en las dependencias del proyecto y no requiere instalación global. Al finalizar, abre la dirección `.workers.dev` que muestra el comando y comprueba la ficha y el panel `?role=dm`.

### Qué causó el fallo del 21 de octubre de 2026

La compilación terminaba correctamente, pero la publicación fallaba con **`Invalid _redirects configuration`**, **`Infinite loop detected`**, código **`100324`**. El archivo `public/_redirects` contenía `/* /index.html 200`: Workers detectaba que esa regla podía volver a aplicarse tras normalizar la URL de destino. Se eliminó la regla y se configuró el soporte SPA nativo en `wrangler.jsonc`.

Las instrucciones anteriores usaban **Pages**, pero el servicio creado en Cloudflare es un **Worker**. Para este servicio utiliza `wrangler deploy`, sin `pages`. No vuelvas a añadir esa regla general en `_redirects`; conserva `assets.not_found_handling: "single-page-application"`. Referencia: [rutas SPA en Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/).

---

## ⚡ Despliegue en Vercel

1. Instala el CLI de Vercel o conecta tu repositorio en [vercel.com](https://vercel.com).
2. El archivo `vercel.json` incluido gestionará las rutas automáticamente.
3. Comando de build: `npm run build` | Carpeta de salida: `dist`.

---

## 🛠️ Comandos de Desarrollo Local

```powershell
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Ejecutar tests automatizados (Vitest)
npm test

# Compilar para producción
npm run build
```
