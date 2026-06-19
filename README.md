# QA DevOps & AI Challenge — QA Store

[![QA CI Pipeline](https://github.com/adrianagit87/qa-devops-ai-challenge/actions/workflows/qa-ci-pipeline.yml/badge.svg)](../../actions/workflows/qa-ci-pipeline.yml)

Flujo completo de calidad para la API de **QA Store** (una tienda/academia en línea):
control de versiones, integración continua, quality gates, pruebas de performance,
seguridad (DevSecOps) y testing de sistemas de IA.

> Reto 5 — DevOps, Calidad Avanzada e Inteligencia Artificial Aplicada en QA.

---

## 🎯 Objetivo

Construir un proceso automatizado que valide la calidad **antes** de integrar cambios a
`main`, resolviendo los problemas del equipo de QA:

- ✅ Estructura clara y profesional del repositorio.
- ✅ Pruebas automatizadas (dejan de correrse a mano).
- ✅ Evidencias de ejecución conservadas como artefactos.
- ✅ Criterios mínimos de calidad (Quality Gates) para aprobar un cambio.
- ✅ Pruebas de performance (K6 y JMeter).
- ✅ IA aplicada a documentación, análisis y testing de asistentes LLM.

## 🛒 Aplicación bajo prueba

API pública del playground de la academia. Mapeo a "QA Store":

| Funcionalidad QA Store | Endpoint | Método | Respuestas |
| ---------------------- | -------- | ------ | ---------- |
| Registro de usuario | `/api/register` | POST | 201 / 422 |
| Inicio de sesión | `/api/login` | POST | 200 / 401 (+ rate-limit) |
| Consulta de cursos/productos | `/api/progress` | GET | 200 |
| Compra simulada (inscripción) | `/api/enroll` | POST | 200 |

**Base URL:** `https://playground.calidadsinhumo.com/api`

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
├── .github/workflows/
│   └── qa-ci-pipeline.yml       # Pipeline CI: tests + performance + secretos
├── docs/
│   ├── test-plan.md             # Plan de pruebas + Quality Gates definidos
│   └── ai-analysis.md           # Matriz de testing de IA + uso responsable
├── performance/
│   ├── k6/
│   │   ├── login-load-test.js   # Prueba de carga con thresholds
│   │   └── results/             # Evidencia: summary JSON + consola
│   └── jmeter/
│       ├── qa-store-flow.jmx    # Escenario completo
│       ├── RESULTS.md           # Resultados documentados
│       └── results/             # Evidencia: .jtl + reporte HTML
├── tests/
│   ├── api/                     # Tests por endpoint (12 casos)
│   └── helpers/config.js        # Config compartida
├── evidence/                    # Reportes y capturas del pipeline
├── .gitleaks.toml               # Config del escaneo de secretos
└── package.json
```

## 🚀 Cómo ejecutar las pruebas

### Requisitos

- Node.js ≥ 20
- K6 (`brew install k6`)
- JMeter (`brew install jmeter`) + Java 17+

### Pruebas funcionales de API

```bash
npm ci                # instala dependencias (reproducible)
npm test              # corre los 12 tests con salida legible
npm run test:ci       # genera además el reporte JUnit en evidence/
```

### Prueba de performance con K6

```bash
npm run perf:k6
# o con exportación de evidencia:
k6 run --summary-export performance/k6/results/login-summary.json \
       performance/k6/login-load-test.js
```

### Escenario de performance con JMeter

```bash
jmeter -n -t performance/jmeter/qa-store-flow.jmx \
  -l performance/jmeter/results/results.jtl \
  -e -o performance/jmeter/results/html-report
```

### Personalización por variables de entorno

```bash
export QA_BASE_URL="https://playground.calidadsinhumo.com/api"
export QA_USER_EMAIL="ana.garcia@ejemplo.com"
export QA_USER_PASSWORD="..."   # en CI: GitHub Secrets, nunca hardcodeado
```

## ✅ Quality Gates

Para aprobar un PR hacia `main`, **todos** estos criterios deben cumplirse
(detalle en [`docs/test-plan.md`](docs/test-plan.md)):

| Quality Gate | Criterio | Estado |
| ------------ | -------- | ------ |
| Pruebas automatizadas | 100% pasan | ✅ 12/12 |
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

Matriz de 6 casos evaluando un asistente LLM de la tienda (relevancia, coherencia,
alucinaciones) + sección de **uso responsable de IA** en
[`docs/ai-analysis.md`](docs/ai-analysis.md).

## 📌 Flujo de trabajo Git

1. Rama de trabajo: `feature/qa-pipeline`.
2. Commits descriptivos siguiendo *conventional commits*.
3. Pull Request hacia `main` (el pipeline corre automáticamente).
4. Merge solo si todos los Quality Gates están en verde.

## 👤 Autora

Adriana Troche — Máster en Calidad de Software.
