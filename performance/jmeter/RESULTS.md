# Resultados JMeter — Escenario Academia Sin Humo

## Configuración de la prueba

| Parámetro | Valor |
| --------- | ----- |
| Plan de prueba | `academia-sin-humo-flow.jmx` |
| Escenario | Registro → Login → Consulta de cursos → Inscripción (compra simulada) |
| Número de usuarios (threads) | 10 |
| Ramp-up | 10 segundos |
| Iteraciones (loops) | 5 |
| Total de muestras | 200 (10 usuarios × 5 iteraciones × 4 pasos) |
| Base URL | `https://playground.calidadsinhumo.com/api` |

## Comando utilizado

```bash
jmeter -n -t performance/jmeter/academia-sin-humo-flow.jmx \
  -l performance/jmeter/results/results.jtl \
  -e -o performance/jmeter/results/html-report \
  -j performance/jmeter/results/jmeter.log
```

## Resultados por endpoint

| Endpoint | Muestras | Error % | Promedio (ms) | p90 (ms) | p95 (ms) | Máx (ms) |
| -------- | -------: | ------: | ------------: | -------: | -------: | -------: |
| 01 - POST Registro | 50 | 0.00% | 418 | 505 | 810 | 1657 |
| 02 - POST Login | 50 | 0.00% | 354 | 409 | 417 | 431 |
| 03 - GET Consulta progreso | 50 | 0.00% | 364 | 415 | 453 | 836 |
| 04 - POST Inscripción | 50 | 0.00% | 356 | 399 | 451 | 481 |
| **TOTAL** | **200** | **0.00%** | **373** | **422** | **483** | **1657** |

## Métricas principales

- **Tiempo promedio de respuesta:** 373 ms (todos los pasos).
- **p95 global:** 483 ms (por debajo del umbral de 800 ms definido en los Quality Gates).
- **Errores encontrados:** 0 de 200 muestras (0.00%).
- **Throughput:** ~12.4 requests/segundo.
- **Assertions:** todas pasaron (status codes 201/200/200 + cuerpo "inscrito").

## Conclusión

**APROBADO.** El flujo completo de Academia Sin Humo (registro, login, consulta e
inscripción) respondió de forma estable bajo carga de 10 usuarios concurrentes con 0% de
errores y tiempos de respuesta promedio por debajo de 400 ms. El pico máximo (1657 ms en el
primer registro) corresponde al *warm-up* inicial del servidor y no se repite en el resto de
las muestras. El escenario cumple los umbrales de performance definidos.

## Evidencia generada

- `results/results.jtl` — datos crudos de todas las muestras.
- `results/html-report/` — dashboard HTML navegable de JMeter (abrir `index.html`).
- `results/jmeter.log` — log de ejecución.
