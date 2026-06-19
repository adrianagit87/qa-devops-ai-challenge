# Plan de Pruebas — Academia Sin Humo

## 1. Objetivo

Establecer el flujo de calidad automatizado para la API de **Academia Sin Humo**
(academia online de cursos de automatización y QA, que además funciona como playground de
práctica con bugs intencionales). El objetivo es doble:

1. Garantizar que ningún cambio se integre a `main` sin cumplir los Quality Gates.
2. **Detectar y documentar los defectos reales** de la aplicación con evidencia reproducible.

## 2. Alcance

| Funcionalidad | Endpoint | Método | Tipo de prueba |
| ------------- | -------- | ------ | -------------- |
| Registro de estudiante | `/api/register` | POST | Funcional, validación, valores límite |
| Inicio de sesión | `/api/login` | POST | Funcional, seguridad (rate-limit) |
| Catálogo de cursos | `/api/courses` | GET | Contrato de datos |
| Progreso / inscripciones | `/api/progress` | GET/POST | Funcional, transición de estados |
| Inscripción (compra simulada) | `/api/enroll` | POST | Funcional, reglas de negocio |

**Base URL:** `https://playground.calidadsinhumo.com/api`

## 3. Reglas de negocio y validación (spec)

Reglas que la app define y contra las que se prueba:

- **Registro:** nombre 2–50 caracteres; email con dominio válido (`x@y.z`); password
  **8–64** caracteres; edad **16–99**. (REQ-R03, REQ-R04)
- **Login:** bloqueo de la cuenta al **5º** intento fallido, por **30 segundos**. (REQ-L03, REQ-L04)
- **Inscripción:** un curso con prerequisito solo se puede tomar si el prerequisito está
  **completado**; si no hay cupos, el estado es "lista-espera". (REQ-A02, REQ-C05)
- **Cursos:** el catálogo (`GET /api/courses`) tiene **9 cursos**: **3 reales** con contenido
  (`playwright-cazador-bugs`, `ia-para-qa`, `api-cazador-bugs`) y **6 de playground** sin
  contenido (`fundamentos`, `playwright-cero`, `diseno-casos`, `api-testing`, `ci-cd-qa`,
  `liderazgo-qa`). Los de playground son los **objetivos de prueba** (donde viven los bugs) y
  forman un árbol de prerequisitos (`fundamentos` → `playwright-cero` → …).

## 4. Tipos de prueba

- **Funcionales de contrato (API):** `node:test` nativo — happy paths y negativos válidos.
- **Caza de bugs:** tests que afirman el comportamiento correcto y documentan defectos
  conocidos (marcados `todo`). Ver `hallazgos.md`.
- **Performance (carga):** K6 sobre `/api/login`.
- **Performance (escenario):** JMeter sobre registro → login → consulta → inscripción.
- **Seguridad (DevSecOps):** escaneo de secretos con gitleaks en el pipeline.
- **Testing de IA:** matriz de evaluación de un asistente LLM (ver `ai-analysis.md`).

## 5. Estrategia de automatización

Cada Pull Request hacia `main` dispara el workflow **QA CI Pipeline**, que ejecuta:

1. Checkout del repositorio.
2. Instalación de dependencias (`npm ci`, reproducible vía `package-lock.json`).
3. Ejecución de pruebas automatizadas.
4. Generación de reporte JUnit + logs de consola.
5. Publicación de artefactos (evidencia descargable).
6. Prueba de performance con K6 (thresholds que actúan como gate).
7. Escaneo de secretos con gitleaks.

## 6. Datos de prueba

Se usan **credenciales de demo públicas** del playground (`ana.garcia@ejemplo.com`). NO son
credenciales reales de ningún usuario, por eso es seguro versionarlas. Cualquier dato
sensible real debe inyectarse vía variables de entorno / GitHub Secrets (`QA_USER_EMAIL`,
`QA_USER_PASSWORD`, `QA_BASE_URL`).

## 7. Criterios de entrada y salida

- **Entrada:** rama `feature/*` con cambios, PR abierto hacia `main`.
- **Salida (aprobación):** todos los Quality Gates en verde + evidencia adjunta. Los
  defectos de la app se reportan en `hallazgos.md` (no bloquean el merge del pipeline, ya
  que son propiedad de la app bajo prueba, no del código de QA).

---

## Quality Gates definidos

Para aprobar un Pull Request hacia `main`, **TODOS** los siguientes criterios deben
cumplirse. Si alguno falla, el merge queda bloqueado.

| # | Quality Gate | Criterio de aceptación | Cómo se verifica | Estado actual |
| - | ------------ | ---------------------- | ---------------- | ------------- |
| 1 | **Pruebas de contrato** | 100% de los tests de contrato pasan (0 fallos) | Job `automated-tests` (reporte JUnit) | ✅ 14/14 |
| 2 | **Tasa de error en performance** | Errores HTTP < 1% | Threshold K6 `http_req_failed: rate<0.01` | ✅ 0.00% |
| 3 | **Tiempo de respuesta** | p95 < 800 ms en login bajo carga | Threshold K6 `http_req_duration: p(95)<800` | ✅ 571 ms |
| 4 | **Sin secretos expuestos** | 0 secretos reales filtrados en el repo | Job `secrets-scan` (gitleaks) | ✅ no leaks |
| 5 | **Evidencia adjunta** | Artefactos generados y publicados por el pipeline | `actions/upload-artifact` | ✅ test + perf |

### Justificación de umbrales

- **p95 < 800 ms:** un usuario percibe como "rápida" una respuesta por debajo de ~1 s.
  Usamos p95 (no el promedio) porque el promedio esconde los casos lentos; el percentil 95
  garantiza que 95 de cada 100 usuarios tengan una experiencia aceptable.
- **Error < 1%:** estándar de la industria para disponibilidad bajo carga moderada.
- **Sin secretos:** principio DevSecOps de "shift-left security" — detectar antes de mergear.

### Diferencia clave: Quality Gates vs. bugs de la app

Los **bugs encontrados** (ver `hallazgos.md`) son defectos de **Academia Sin Humo**, la app
bajo prueba — no del código de este repositorio de QA. Por eso se documentan como
hallazgos y se cubren con tests `todo`, pero **no tumban el pipeline**: los Quality Gates
miden la salud de NUESTRO trabajo de QA (tests verdes, performance, sin secretos), no la
del software de terceros que estamos evaluando.

### Recomendación de configuración en GitHub

Marcar los jobs `automated-tests`, `performance` y `secrets-scan` como **required status
checks** en la protección de la rama `main` (Settings → Branches → Branch protection rules).
