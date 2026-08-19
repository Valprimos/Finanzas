# Finanzas — app de finanzas personales

App de finanzas personales **muy visual, local-first y privada**. Añade gastos e ingresos en segundos, organízalos por categorías, controla presupuestos y mira tu dinero en gráficos claros — todo sin que un solo byte de tus datos salga de tu dispositivo.

![stack](https://img.shields.io/badge/Next.js-16-black) ![stack](https://img.shields.io/badge/TypeScript-strict-blue) ![stack](https://img.shields.io/badge/TailwindCSS-4-06B6D4) ![privacidad](https://img.shields.io/badge/datos-100%25%20locales-35D99A)

## Índice

1. [Por qué local-first](#por-qué-local-first)
2. [Arquitectura](#arquitectura)
3. [Estructura de carpetas](#estructura-de-carpetas)
4. [Modelo de datos](#modelo-de-datos)
5. [Funcionalidades](#funcionalidades)
6. [Ejecutar en local](#ejecutar-en-local)
7. [Subir a GitHub](#subir-a-github)
8. [Desplegar en Vercel](#desplegar-en-vercel)
9. [Seguridad y privacidad](#seguridad-y-privacidad)
10. [Trade-offs y límites reales de privacidad](#trade-offs-y-límites-reales-de-privacidad)
11. [Roadmap opcional](#roadmap-opcional)

---

## Por qué local-first

Pediste que tus datos estén protegidos "de verdad": sin exposición accidental, sin analíticas, sin tracking, sin terceros. La forma más directa de garantizar eso técnicamente es **no tener backend en absoluto**:

- Todos los datos (transacciones, categorías, presupuestos, recurrentes, ajustes) se guardan en **IndexedDB**, dentro del propio navegador del usuario.
- No hay servidor de aplicación, no hay base de datos remota, no hay API que exponga tus movimientos.
- Nada se envía por red. La app funciona igual con el WiFi apagado.
- Cero superficie de ataque del lado servidor: no hay nada que un atacante pueda "hackear" en un backend, porque no existe.

Esto es una elección deliberada frente a "backend con base de datos + login": con local-first, la privacidad no depende de que un servidor esté bien configurado — simplemente no hay servidor que pueda filtrar tus datos.

## Arquitectura

```
Next.js 16 (App Router) ─┬─ Componentes de servidor: layout, metadata
                          └─ Componentes de cliente ("use client"):
                               toda la interactividad vive en el navegador

Estado global ── React Context (src/lib/store.tsx)
                     │
                     ▼
Persistencia ── IndexedDB vía idb-keyval (src/lib/db.ts)
                     │
                     ▼
             Nunca sale del dispositivo del usuario
```

- **Next.js 16 + TypeScript + Tailwind CSS 4**: base moderna, tipada y con build muy rápido (Turbopack).
- **Sin backend, sin ORM, sin base de datos remota**: todo el "servidor" es estático.
- **Recharts** para las visualizaciones (área, barras, donut).
- **lucide-react** para iconografía consistente.
- **next-themes** para modo oscuro/claro persistente.
- Componentes de interfaz (botón, tarjeta, input, diálogo…) están hechos a mano, inspirados en shadcn/ui pero **sin depender de su CLI ni de un registro externo** — menos dependencias, menos superficie de ataque en la cadena de suministro.

## Estructura de carpetas

```
finanzas-app/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx           # Layout raíz: fuentes, tema, providers
│  │  ├─ globals.css          # Tokens de diseño (colores, tipografía)
│  │  ├─ page.tsx             # Dashboard / resumen
│  │  ├─ transacciones/       # Lista de movimientos (búsqueda/filtros)
│  │  ├─ estadisticas/        # Gráficos y comparativas
│  │  ├─ presupuestos/        # Presupuestos + recurrentes
│  │  ├─ categorias/          # Gestión de categorías
│  │  └─ ajustes/             # Moneda, backup, privacidad, borrado
│  ├─ components/
│  │  ├─ ui/                  # Button, Card, Input, Select, Dialog…
│  │  ├─ charts/              # TendenciaMensual, GastoPorCategoria…
│  │  ├─ app-shell.tsx        # Navegación lateral + móvil
│  │  ├─ transaction-form.tsx # Alta/edición rápida de movimientos
│  │  ├─ transaction-list.tsx # Lista con filtros y orden
│  │  ├─ budget-manager.tsx
│  │  ├─ recurring-manager.tsx
│  │  ├─ category-manager.tsx
│  │  └─ settings-panel.tsx
│  └─ lib/
│     ├─ types.ts             # Modelo de datos
│     ├─ db.ts                # Capa de persistencia (IndexedDB)
│     ├─ store.tsx            # Estado global (Context)
│     ├─ recurrentes.ts       # Motor de generación de recurrentes
│     ├─ presupuestos.ts      # Cálculo de estado de presupuestos
│     ├─ exportar.ts          # Export/import CSV y JSON
│     ├─ categorias-default.ts
│     ├─ iconos.ts
│     ├─ format.ts
│     └─ utils.ts
├─ public/
│  └─ manifest.json           # PWA ligera (instalable en móvil)
├─ .env.example
└─ README.md
```

## Modelo de datos

```ts
Transaction {
  id, tipo: "gasto" | "ingreso", importe, fecha,
  categoriaId, descripcion?, metodoPago?, cuentaId?,
  recurrenteId?, creadoEn, actualizadoEn
}

Category {
  id, nombre, tipo: "gasto" | "ingreso", color, icono, esPredeterminada?
}

Budget {
  id, categoriaId, limite, mes: "todos" | "yyyy-MM"
}

RecurringRule {
  id, tipo, importe, categoriaId, frecuencia: "diaria"|"semanal"|"mensual"|"anual",
  fechaInicio, fechaFin?, ultimaGeneracion?, activo
}

AppSettings {
  moneda, localeFormato, tema, nombreUsuario?
}
```

Todo vive en `src/lib/types.ts` y se persiste como arrays serializables en IndexedDB (una clave por "tabla"), lo que hace trivial exportar/importar un backup completo.

## Funcionalidades

- **Alta rápida**: botón flotante siempre visible → formulario con importe grande como protagonista, categoría, fecha, descripción, método de pago y cuenta opcionales.
- **Movimientos**: búsqueda por texto, filtros por tipo/categoría/fecha, ordenación, edición y borrado inline.
- **Categorías personalizables**: color e icono a elegir, separadas por tipo (gasto/ingreso).
- **Resumen**: balance, ingresos y gastos totales del mes, con navegación mes a mes.
- **Estadísticas**: evolución mensual, ingresos vs. gastos, gasto por categoría (donut), top categorías.
- **Presupuestos** por categoría con barra de progreso y aviso cuando llegas al 80% o te pasas.
- **Objetivos de ahorro**: define una meta (ej. "2000 € para diciembre") y ve añadiendo aportaciones a mano; independiente de los presupuestos.
- **Comparativa mensual**: en el resumen se ve automáticamente cuánto han subido o bajado tus gastos e ingresos respecto al mes anterior.
- **Etiquetas**: además de la categoría, cada movimiento admite etiquetas libres (ej. "viaje portugal") que cruzan varias categorías. Se pueden filtrar en la lista de movimientos.
- **Calendario de gasto**: en Estadísticas, un calendario mensual con un punto de color por día (bajo/medio/alto) según cuánto gastaste ese día en relación con tu media del mes.
- **Recurrentes**: gastos e ingresos que se generan solos (diaria/semanal/mensual/anual), con pausa/activación.
- **Exportar/importar**: backup completo en JSON y movimientos en CSV (incluye etiquetas).
- **Logo con modo oscuro/claro**: coloca `logo.png` (modo claro) y `logoclaro.png` (modo oscuro) en `/public` — la app elige el correcto automáticamente.
- **Modo oscuro** (por defecto) **y claro**, con paleta y tipografía cuidadas específicamente para esta app.
- **Responsive**: navegación lateral en escritorio, barra inferior + FAB en móvil.

## Ejecutar en local

Requisitos: Node.js 20+ y npm.

```bash
# 1. Instala dependencias
npm install

# 2. Arranca el servidor de desarrollo
npm run dev

# 3. Abre http://localhost:3000
```

No hace falta configurar ninguna variable de entorno para empezar a usarla.

Para generar la build de producción localmente:

```bash
npm run build
npm start
```

## Subir a GitHub

```bash
git init
git add .
git commit -m "Primera versión de la app de finanzas"

# Crea un repositorio vacío en GitHub y luego:
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git branch -M main
git push -u origin main
```

`node_modules`, `.next` y cualquier `.env*` ya están en `.gitignore`, así que nunca se suben accidentalmente.

## Desplegar en Vercel

**Opción A — desde la web (recomendada):**

1. Entra en [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. "Add New… → Project" y selecciona el repositorio que acabas de subir.
3. Vercel detecta Next.js automáticamente — no hace falta tocar nada en "Build & Output Settings".
4. Como la app no usa variables de entorno, puedes darle a "Deploy" directamente.
5. En 1-2 minutos tendrás una URL pública (`tu-proyecto.vercel.app`).

**Opción B — desde la terminal:**

```bash
npm install -g vercel
vercel        # despliegue de prueba
vercel --prod # despliegue a producción
```

Cada vez que hagas `git push` a `main`, Vercel desplegará automáticamente la nueva versión.

## Seguridad y privacidad

- **Sin backend = sin superficie de ataque del lado servidor.** No hay API que exponga datos, no hay base de datos remota que pueda sufrir una fuga.
- **Sin analíticas ni tracking**: no se ha incluido ningún SDK de analítica, píxel o script de terceros.
- **Sin dependencias innecesarias**: se ha evitado deliberadamente cualquier librería de estado, UI kit o CLI externa que no aportara valor real; los componentes de interfaz están escritos a mano.
- **Validación de inputs**: los importes se parsean y validan (deben ser numéricos y mayores que cero) antes de guardarse; los formularios no permiten guardar sin categoría.
- **Sin logs de datos sensibles**: la app no genera logs de servidor (no hay servidor que procese tus movimientos); los `console.error` existentes solo registran errores técnicos de IndexedDB, nunca contenido de tus transacciones.
- **CSV/JSON export**: al exportar, los campos de texto libre se escapan correctamente para evitar problemas de inyección CSV al abrir el archivo en Excel/Sheets.
- **XSS**: React escapa por defecto todo el contenido dinámico; en ningún punto de la app se usa `dangerouslySetInnerHTML`.
- **CSRF**: no aplica — no hay endpoints de servidor que reciban peticiones autenticadas de estado.
- Si en el futuro despliegas alguna función de servidor (por ejemplo, para sincronizar entre dispositivos), sigue estas pautas: usa siempre variables de entorno para credenciales (nunca hardcodeadas), añade autenticación real antes de exponer cualquier dato, y cifra en reposo cualquier dato sensible que llegue a guardarse fuera del dispositivo.

## Trade-offs y límites reales de privacidad

"Que nadie pueda ver mis datos de ninguna manera" no se puede garantizar al 100% en ningún sistema informático, y esta app no es una excepción:

| Escenario | ¿Está protegido? | Explicación |
|---|---|---|
| Un servidor de terceros lee tus datos | Sí | No existen; nunca se envían por red. |
| Alguien con acceso físico a tu dispositivo desbloqueado | No | Puede abrir el navegador y ver los datos, igual que vería cualquier otro archivo tuyo. IndexedDB no está cifrado por defecto por el navegador. |
| Malware/extensiones maliciosas en tu navegador | No | Cualquier código que corra con permisos en tu navegador podría, en teoría, leer el almacenamiento local de cualquier sitio, incluido este. |
| Borrar caché/datos del navegador | Se pierde | Si borras "datos de navegación" de este sitio, se pierde todo. Por eso existe el backup exportable — haz copias periódicas. |
| Sincronizar entre varios dispositivos | No incluido | Al ser local-first puro, los datos no se sincronizan solos entre tu móvil y tu portátil. Usa "Exportar backup" en uno e "Importar" en el otro. |

La forma más segura posible con estas limitaciones es exactamente la que se ha construido: cero transmisión de datos por red. Si en el futuro quieres sincronización multi-dispositivo, la alternativa más privada sería cifrar el backup con una contraseña tuya antes de que salga del dispositivo, de forma que ni siquiera el proveedor de almacenamiento pueda leer el contenido.

## Roadmap opcional

- Bloqueo de la app con PIN/biometría local para el escenario de acceso físico al dispositivo.
- Cifrado del backup exportado con una contraseña antes de guardarlo.
- Sincronización opcional end-to-end cifrada entre dispositivos.
- Gráfico de tendencias por cuenta/monedero.
- Iconos propios para la instalación como PWA.
