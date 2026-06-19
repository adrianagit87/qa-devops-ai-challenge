# QA DevOps & AI Challenge — Academia Sin Humo

[![QA CI Pipeline](https://github.com/adrianagit87/qa-devops-ai-challenge/actions/workflows/qa-ci-pipeline.yml/badge.svg)](../../actions/workflows/qa-ci-pipeline.yml)

Flujo completo de calidad sobre la API de **Academia Sin Humo**: control de versiones,
integración continua, quality gates, pruebas de performance, seguridad (DevSecOps),
**caza de bugs reales** y testing de sistemas de IA.

> Reto 5 — DevOps, Calidad Avanzada e Inteligencia Artificial Aplicada en QA.

---

## 🎯 Objetivo

Construir un proceso automatizado que valide la calidad **antes** de integrar cambios a
`main`, y que además **detecte y documente defectos reales** de la aplicación bajo prueba.

- ✅ Estructura clara y profesional del repositorio.
- ✅ Pruebas automatizadas (dejan de correrse a mano).
- ✅ Evidencias de ejecución conservadas como artefactos.
- ✅ Criterios mínimos de calidad (Quality Gates) para aprobar un cambio.
- ✅ Pruebas de performance (K6 y JMeter).
- ✅ Bugs reales encontrados, reproducidos y documentados con técnica ISTQB.
- ✅ IA aplicada a documentación, análisis y testing de asistentes LLM.

## 🏫 Aplicación bajo prueba: Academia Sin Humo

**Academia Sin Humo** es una academia online de cursos de automatización y QA. Ofrece **3
cursos reales** (con contenido) y, además, un conjunto de **cursos de playground** que NO
tienen contenido: son *fixtures de práctica* con *bugs intencionales* para que quien estudia
los cace aplicando técnicas de diseño de pruebas. Eso la convierte en un objetivo ideal para
un portafolio QA real — acá no solo verificamos que algo funciona, también **demostramos los
defectos** con evidencia reproducible.

En el escenario del reto, Academia Sin Humo cumple el rol de la "QA Store": consultar
productos (cursos), iniciar sesión y simular una compra (inscripción).

### Endpoints probados

| Funcionalidad | Endpoint | Método | Respuestas |
| ------------- | -------- | ------ | ---------- |
| Registro de estudiante | `/api/register` | POST | 201 / 422 |
| Inicio de sesión | `/api/login` | POST | 200 / 401 / 429 (rate-limit) |
| Catálogo de cursos | `/api/courses` | GET | 200 |
| Progreso / inscripciones | `/api/progress` | GET / POST | 200 |
| Inscripción a curso (compra) | `/api/enroll` | POST | 200 / 400 / 404 / 409 |

**Base URL:** `https://playground.calidadsinhumo.com/api`

### Catálogo de cursos (`GET /api/courses` → 9 cursos)

**Cursos reales (con contenido):**

| id | Curso | Nivel |
| -- | ----- | ----- |
| `playwright-cazador-bugs` | Automatización con Playwright: de cero a cazador de bugs | Intermedio |
| `ia-para-qa` | IA aplicada al testing | Avanzado |
| `api-cazador-bugs` | API Testing con Playwright: caza bugs bajo la UI | Avanzado |

**Cursos de playground (práctica, sin contenido):** `fundamentos`, `playwright-cero`,
`diseno-casos`, `api-testing`, `ci-cd-qa`, `liderazgo-qa`. Son los **objetivos de las pruebas
QA**: forman un árbol de **prerequisitos** (un curso se desbloquea al completar el anterior)
y es donde viven los bugs intencionales que cazamos en este proyecto.

## 🐞 Bugs encontrados

Se reprodujeron y verificaron por API **6 defectos**, cubiertos por tests automatizados:

| ID | Defecto | Severidad |
| -- | ------- | --------- |
| I-1 | La API permite inscribirse sin cumplir el prerequisito | Alta |
| R-1 | Acepta password de 65 caracteres (máx 64) | Media |
| R-2 | Acepta email sin dominio (`usuario@`) | Media |
| L-1 | Bloquea la cuenta al 4º intento en vez del 5º | Media |
| L-2 | El tiempo de desbloqueo reportado (25s) no coincide con el real (30s) | Media |
| I-3 | En curso lleno, el estado mostrado dice "inscrito" en vez de "lista-espera" | Baja |

Detalle completo (18 hallazgos, técnica ISTQB, REQ violado y evidencia) en
[`docs/hallazgos.md`](docs/hallazgos.md).

## 🧰 Herramientas utilizadas

| Categoría | Herramienta |
| --------- | ----------- |
| Lenguaje / runtime | Node.js 22 (test runner nativo `node:test`, `fetch` nativo) |
| CI/CD | GitHub Actions |
| Performance (carga) | K6 |
| Performance (escenario) | Apache JMeter |
| Seguridad (DevSecOps) | gitleaks |
| Control de versiones | Git + GitHub (ramas, PR) |

> **Decisión de diseño:** cero dependencias externas en los tests. Menos paquetes =
> pipeline más rápido, reproducible y sin vulnerabilidades heredadas (`0 vulnerabilities`).

## 📁 Estructura del proyecto

```
qa-devops-ai-challenge/
├── .github/workflows/qa-ci-pipeline.yml   # Pipeline CI: tests + performance + secretos
├── docs/
│   ├── test-plan.md             # Plan de pruebas + Quality Gates definidos
│   ├── hallazgos.md             # Tabla de hallazgos (bugs reales encontrados)
│   └── ai-analysis.md           # Matriz de testing de IA + uso responsable
├── performance/
│   ├── k6/login-load-test.js    # Prueba de carga con thresholds
│   └── jmeter/qa-store-flow.jmx # Escenario completo (registro→login→consulta→inscripción)
├── tests/
│   ├── api/                     # Tests de contrato (verde) + caza de bugs (todo)
│   └── helpers/config.js        # Config compartida
└── package.json
```

## 🧪 Estrategia de testing

Los tests están separados en dos carpetas con propósitos distintos:

- **Tests de contrato** (`tests/api/`, comando `npm test`): validan que las funcionalidades
  correctas responden según su contrato (status codes, estructura). Pasan 100% en verde y
  son los que sostienen los Quality Gates.
- **Tests de caza de bugs** (`tests/bugs/`, comando `npm run test:bugs`): afirman el
  comportamiento **correcto** según la spec. Como la app tiene defectos, su aserción no pasa
  y se marcan como `todo` (defecto conocido): documentan el bug **sin contar como fallo**
  (`fail 0`, exit 0). Si la app se corrige, se quita el `todo` y pasan a verde, convirtiéndose
  en tests de regresión.

> **Nota:** al correr los tests de bugs, Node los imprime con una ✖ y un `AssertionError`
> bajo el encabezado "failing tests". **No son fallos** — fijate siempre en el resumen
> (`fail 0`) y el exit code (`0`). Son los defectos documentados a propósito.

## 🚀 Cómo ejecutar las pruebas

```bash
npm ci             # instala dependencias (reproducible)
npm test           # 15 tests de contrato — 100% verde, sin ✖
npm run test:bugs  # 6 defectos documentados (todo) — exit 0
npm run test:all   # contratos + bugs juntos
npm run test:ci    # contratos + reporte JUnit en evidence/ (lo que corre el pipeline)
npm run perf:k6    # prueba de carga K6
```

Escenario JMeter:

```bash
jmeter -n -t performance/jmeter/qa-store-flow.jmx \
  -l performance/jmeter/results/results.jtl \
  -e -o performance/jmeter/results/html-report
```

Personalización por entorno (en CI, vía GitHub Secrets — nunca hardcodeado):

```bash
export QA_BASE_URL="https://playground.calidadsinhumo.com/api"
export QA_USER_EMAIL="ana.garcia@ejemplo.com"
export QA_USER_PASSWORD="..."
```

## ✅ Quality Gates

Para aprobar un PR hacia `main`, **todos** estos criterios deben cumplirse
(detalle en [`docs/test-plan.md`](docs/test-plan.md)):

| Quality Gate | Criterio | Estado |
| ------------ | -------- | ------ |
| Tests de contrato | 100% pasan | ✅ 15/15 |
| Tasa de error (performance) | < 1% | ✅ 0.00% |
| Tiempo de respuesta | p95 < 800 ms | ✅ 571 ms (K6) / 475 ms (JMeter) |
| Sin secretos expuestos | 0 leaks | ✅ gitleaks |
| Evidencia adjunta | artefactos publicados | ✅ |

## 📊 Resultados de performance

| Herramienta | Carga | Errores | p95 | Veredicto |
| ----------- | ----- | ------- | --- | --------- |
| K6 (login) | 10 VUs / 60s / 357 reqs | 0.00% | 571 ms | ✅ Aprobado |
| JMeter (flujo) | 10 usuarios / 5 iter / 200 muestras | 0.00% | 475 ms | ✅ Aprobado |

## 🤖 Testing de IA

Matriz de casos evaluando un asistente LLM de la academia (relevancia, coherencia,
alucinaciones) + sección de **uso responsable de IA** en
[`docs/ai-analysis.md`](docs/ai-analysis.md).

## 📌 Flujo de trabajo Git

1. Rama de trabajo: `feature/qa-pipeline`.
2. Commits descriptivos siguiendo *conventional commits*.
3. Pull Request hacia `main` (el pipeline corre automáticamente).
4. Merge solo si todos los Quality Gates están en verde.

## 👤 Autora

Adriana Troche — Máster Profesional en QA y Automatización de Pruebas.
