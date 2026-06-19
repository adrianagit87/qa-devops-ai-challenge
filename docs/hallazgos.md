# Tabla de Hallazgos — Academia Sin Humo

Defectos encontrados al probar la API del playground de **Academia Sin Humo**
(`https://playground.calidadsinhumo.com/api`). La app es un entorno de práctica QA que
contiene bugs intencionales; este documento los reporta con técnica de diseño de pruebas
(ISTQB), el requisito violado, la evidencia y la severidad.

> **Verificado en vivo:** los 6 hallazgos marcados con ✅ fueron reproducidos por API
> contra el playground desplegado y están cubiertos por tests automatizados en
> `tests/api/bugs.test.js` (marcados como `todo` / defecto conocido).

> **Nota sobre los datos de prueba:** los bugs se reproducen sobre los **cursos de
> playground** (`fundamentos`, `playwright-cero`, `api-testing`, …), que son fixtures de
> práctica sin contenido. Los 3 cursos reales de la academia (`playwright-cazador-bugs`,
> `ia-para-qa`, `api-cazador-bugs`) no se usan como objetivo de la caza de bugs.

## Resumen

| Severidad | Cantidad | IDs |
| --------- | -------- | --- |
| Alta | 2 | I-1, P-2 |
| Media | 9 | R-1, L-1, L-2, I-2, I-4, P-1, D-1, N-1, U-2 |
| Baja | 7 | R-2*, R-3, I-3, D-2, N-2, U-1 |

\* R-2 se clasifica como Media por su impacto en integridad de datos (ver detalle).

---

## Hallazgos verificados por API (con test automatizado)

### ✅ I-1 — Inscripción sin prerequisito vía API · Severidad: **Alta**

- **Requisito violado:** REQ-A02 (la API debe validar prerequisitos igual que la UI).
- **Técnica:** Tabla de decisión.
- **Endpoint:** `POST /api/enroll`.
- **Pasos:** llamar al endpoint con un curso que requiere prerequisito sin haberlo completado.
- **Evidencia:**
  ```bash
  curl -s https://playground.calidadsinhumo.com/api/enroll \
    -H 'Content-Type: application/json' \
    --data-raw '{"courseId":"playwright-cero"}'
  # → 200 {"status":"inscrito", ... "Inscripción exitosa a \"Playwright desde cero\""}
  ```
- **Esperado:** `403 Forbidden` — `playwright-cero` requiere `fundamentos` completado.
- **Obtenido:** `200 OK`, inscripción aceptada.
- **Impacto:** la regla de negocio se puede saltar invocando la API directamente. La
  validación de la UI es cosmética. **Alta**: rompe la integridad del flujo de aprendizaje.
- **Test:** `bugs.test.js` → "BUG I-1".

### ✅ R-1 — Password de 65 caracteres aceptado · Severidad: **Media**

- **Requisito violado:** REQ-R04 (password entre 8 y 64 caracteres inclusive).
- **Técnica:** Valores límite.
- **Endpoint:** `POST /api/register`.
- **Pasos:** registrar con un password de exactamente 65 caracteres.
- **Evidencia:** `201 Created` (registro exitoso) con password de 65 chars.
- **Esperado:** `422` — la validación usa `> 65` en vez de `> 64`.
- **Impacto:** datos fuera de spec en el borde superior. Clásico off-by-one.
- **Test:** `bugs.test.js` → "BUG R-1".

### ✅ R-2 — Email sin dominio aceptado · Severidad: **Media**

- **Requisito violado:** REQ-R03 (email con formato válido y dominio).
- **Técnica:** Partición de equivalencia.
- **Endpoint:** `POST /api/register`.
- **Pasos:** registrar con `email = "usuario@"`.
- **Evidencia:**
  ```bash
  curl -s https://playground.calidadsinhumo.com/api/register \
    -H 'Content-Type: application/json' \
    --data-raw '{"name":"Test","email":"usuario@","password":"Holamundo1123","age":"25"}'
  # → 201 {"message":"Registro exitoso", "user":{"email":"usuario@", ...}}
  ```
- **Esperado:** `422` — la regex `/.+@.*/` debería ser `/.+@.+\..+/`.
- **Impacto:** se guardan emails inválidos; rompe notificaciones y unicidad. Integridad de datos.
- **Test:** `bugs.test.js` → "BUG R-2".

### ✅ L-1 — Bloqueo tras 4 intentos en vez de 5 · Severidad: **Media**

- **Requisito violado:** REQ-L03 (bloqueo al 5º intento fallido).
- **Técnica:** Valores límite.
- **Endpoint:** `POST /api/login`.
- **Pasos:** fallar el login 4 veces seguidas en la misma sesión (cookie).
- **Evidencia:** el 4º intento responde `429` "Cuenta bloqueada... por 30 segundos",
  aunque la propia respuesta declara `maxAttempts: 5`.
- **Esperado:** el 4º intento devuelve `401` (`remaining: 1`); recién el 5º bloquea.
- **Obtenido:** bloqueo en el 4º (`>= MAX_ATTEMPTS - 1`).
- **Impacto:** usuarios legítimos bloqueados un intento antes de lo previsto.
- **Test:** `bugs.test.js` → "BUG L-1".

### ✅ L-2 — Desfase entre lockout real y reportado · Severidad: **Media**

- **Requisito violado:** REQ-L04 (el tiempo reportado debe coincidir con el bloqueo real).
- **Técnica:** Estado / consistencia.
- **Endpoint:** `POST /api/login`.
- **Pasos:** provocar el bloqueo y leer la respuesta `429`.
- **Evidencia:** el mensaje dice "bloqueada por **30** segundos" pero el campo
  `unlockIn` reporta **25** (`Math.max(0, remainingSeconds - 5)`).
- **Esperado:** `unlockIn = 30`.
- **Impacto:** información contradictoria al usuario; el cliente que confíe en `unlockIn`
  reintentará 5 segundos antes de tiempo.
- **Test:** `bugs.test.js` → "BUG L-2".

### ✅ I-3 — Estado de inscripción inconsistente en curso lleno · Severidad: **Baja**

- **Requisito violado:** REQ-C05 (el estado mostrado debe reflejar el estado real).
- **Técnica:** Estado de UI / consistencia.
- **Endpoint:** `POST /api/enroll`.
- **Pasos:** inscribirse a un curso lleno (`api-testing`, 20/20).
- **Evidencia:** la respuesta trae `status: "lista-espera"` pero `displayStatus: "inscrito"`.
- **Esperado:** `displayStatus = "lista-espera"`.
- **Impacto:** el usuario cree estar inscrito cuando está en lista de espera.
- **Test:** `bugs.test.js` → "BUG I-3".

---

## Hallazgos documentados (requieren UI o flujo manual)

Estos defectos están en el código de la app pero su reproducción confiable requiere la
interfaz o flujos con estado más complejos; se documentan para completitud y como backlog
de automatización futura.

| ID | Página | Severidad | Título | Técnica | REQ |
| -- | ------ | --------- | ------ | ------- | --- |
| R-3 | /registro | Baja | El formulario no se limpia tras un registro exitoso | Comportamiento de formulario | REQ-R06 |
| I-2 | /cursos | Media | El cupo no se reduce al inscribirse | Estado / consistencia | REQ-C04 |
| I-4 | /cursos | Media | Un curso se desbloquea con solo inscribirse al prerequisito (no completarlo) | Tabla de decisión | REQ-C03 |
| P-1 | /mi-progreso | Media | "Abandonado" (estado terminal) permite "Retomar" | Transición de estados | REQ-P03 |
| P-2 | /mi-progreso | **Alta** | Certificado duplicado al re-certificar (sin idempotencia) | Idempotencia | REQ-P04 |
| D-1 | /reserva | Media | La reserva acepta una fecha a 31 días (máx 30) | Valores límite | REQ-D02 |
| D-2 | /reserva | Baja | No valida que la fecha de fin sea posterior a la de inicio | Partición de equivalencia | REQ-D03 |
| N-1 | /estudiantes | Media | La última página de resultados se pierde (Math.floor en vez de ceil) | Valores límite | REQ-N02 |
| N-2 | /estudiantes | Baja | Cada página repite un registro (slice con +1) | Valores límite | REQ-N03 |
| U-1 | /perfil | Baja | La subida de CV acepta archivos que no son PDF | Partición de equivalencia | REQ-U02 |
| U-2 | /perfil | Media | El límite de tamaño redondea mal y acepta casi 3 MB (máx 2 MB) | Valores límite | REQ-U03 |

> Nota: P-1 y P-2 son reproducibles por API (`POST /api/progress`) pero requieren montar
> primero un estado de inscripción/avance; quedan como próximo incremento de automatización.

## Conclusión

Se identificaron **18 defectos**, de los cuales **6 fueron reproducidos y verificados por
API** con tests automatizados. El patrón dominante son fallos de **valores límite**
(off-by-one) y de **consistencia de estado** entre lo reportado y lo real. El hallazgo más
crítico es **I-1**: la API no replica las validaciones de negocio de la UI, lo que permite
saltar reglas invocando los endpoints directamente — un riesgo de seguridad y de
integridad clásico en aplicaciones donde "la UI valida, el backend confía".
