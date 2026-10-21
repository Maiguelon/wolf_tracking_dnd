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

## 🚀 Despliegue en Cloudflare Pages (Gratis)

El proyecto está 100% optimizado para **Cloudflare Pages**:

### Opción 1: Conectar Repositorio GitHub (Recomendado)
1. Sube este repositorio a tu cuenta de GitHub.
2. Entra en tu dashboard de **Cloudflare** > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Selecciona el repositorio `wolf_tracking_dnd`.
4. Configura los parámetros de compilación:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
5. Haz clic en **Save and Deploy**.
6. ¡Listo! Cloudflare te dará un subdominio `.pages.dev` gratis y con SSL automático (también puedes enlazar tu dominio propio en 1 clic).

### Opción 2: Despliegue Directo con Wrangler CLI
```powershell
npm install -g wrangler
wrangler pages deploy dist --project-name=wolf-tracker
```

*(Nota: el archivo `public/_redirects` ya está incluido para que las rutas SPA como `/dm` no den error 404 en Cloudflare).*

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
