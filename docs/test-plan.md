# Plan de Pruebas — QA Store

## 1. Objetivo

Establecer el flujo de calidad automatizado para la API de **QA Store** (tienda/academia
en línea), garantizando que ningún cambio se integre a `main` sin cumplir los criterios
mínimos de calidad definidos en este documento.

## 2. Alcance

Se prueban los endpoints públicos de la API del playground:

| Funcionalidad QA Store | Endpoint | Método | Tipo de prueba |
| ---------------------- | -------- | ------ | -------------- |
| Registro de usuario | `/api/register` | POST | Funcional (positiva/negativa), validación |
| Inicio de sesión | `/api/login` | POST | Funcional, seguridad (rate-limit), performance |
| Consulta de productos/cursos | `/api/progress` | GET | Funcional, contrato de datos |
| Compra simulada (inscripción) | `/api/enroll` | POST | Funcional, contrato de respuesta |

**Base URL:** `https://playground.calidadsinhumo.com/api`

## 3. Tipos de prueba

- **Funcionales de API:** Node.js test runner nativo (`node:test`) — 12 casos.
- **Performance (carga):** K6 sobre `/api/login`.
- **Performance (escenario):** JMeter sobre el flujo registro → login → consulta → inscripción.
- **Seguridad (DevSecOps):** escaneo de secretos con gitleaks en el pipeline.
- **Testing de IA:** matriz de evaluación de respuestas de un asistente LLM (ver `ai-analysis.md`).

## 4. Estrategia de automatización

Cada Pull Request hacia `main` dispara el workflow **QA CI Pipeline**
(`.github/workflows/qa-ci-pipeline.yml`), que ejecuta:

1. Checkout del repositorio.
2. Instalación de dependencias (`npm ci`, reproducible vía `package-lock.json`).
3. Ejecución de pruebas automatizadas.
4. Generación de reporte JUnit + logs de consola.
5. Publicación de artefactos (evidencia descargable).
6. Prueba de performance con K6 (thresholds que actúan como gate).
7. Escaneo de secretos con gitleaks.

## 5. Datos de prueba

Se usan **credenciales de demo públicas** provistas por la academia
(`ana.garcia@ejemplo.com`). NO son credenciales reales de ningún usuario, por eso es
seguro versionarlas. Cualquier dato sensible real debe inyectarse vía variables de
entorno / GitHub Secrets (`QA_USER_EMAIL`, `QA_USER_PASSWORD`, `QA_BASE_URL`).

## 6. Criterios de entrada y salida

- **Entrada:** rama `feature/*` con cambios, PR abierto hacia `main`.
- **Salida (aprobación):** todos los Quality Gates en verde + evidencia adjunta.

---

## Quality Gates definidos

Para aprobar un Pull Request hacia `main`, **TODOS** los siguientes criterios deben
cumplirse. Si alguno falla, el merge queda bloqueado.

| # | Quality Gate | Criterio de aceptación | Cómo se verifica | Estado actual |
| - | ------------ | ---------------------- | ---------------- | ------------- |
| 1 | **Pruebas automatizadas** | 100% de los tests pasan (0 fallos) | Job `automated-tests` (reporte JUnit) | ✅ 12/12 |
| 2 | **Tasa de error en performance** | Errores HTTP < 1% | Threshold K6 `http_req_failed: rate<0.01` | ✅ 0.00% |
| 3 | **Tiempo de respuesta** | p95 < 800 ms en login bajo carga | Threshold K6 `http_req_duration: p(95)<800` | ✅ 571 ms |
| 4 | **Sin secretos expuestos** | 0 secretos reales filtrados en el repo | Job `secrets-scan` (gitleaks) | ✅ no leaks |
| 5 | **Evidencia adjunta** | Artefactos generados y publicados por el pipeline | `actions/upload-artifact` | ✅ test + perf |

### Justificación de umbrales

- **p95 < 800 ms:** un usuario percibe como "rápida" una respuesta por debajo de ~1 s.
  Usamos p95 (no el promedio) porque el promedio esconde los casos lentos; el percentil 95
  garantiza que 95 de cada 100 usuarios tengan una experiencia aceptable.
- **Error < 1%:** estándar de la industria para disponibilidad bajo carga moderada.
- **Sin secretos:** principio DevSecOps de "shift-left security" — detectar antes de mergear,
  no en producción.

### Recomendación de configuración en GitHub

Marcar los jobs `automated-tests`, `performance` y `secrets-scan` como **required status
checks** en la protección de la rama `main` (Settings → Branches → Branch protection rules).
Así GitHub impide el merge si cualquier gate falla.
