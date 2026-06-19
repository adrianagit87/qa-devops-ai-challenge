# Resultados JMeter — Escenario QA Store

## Configuración de la prueba

| Parámetro | Valor |
| --------- | ----- |
| Plan de prueba | `qa-store-flow.jmx` |
| Escenario | Registro → Login → Consulta de cursos → Inscripción (compra simulada) |
| Número de usuarios (threads) | 10 |
| Ramp-up | 10 segundos |
| Iteraciones (loops) | 5 |
| Total de muestras | 200 (10 usuarios × 5 iteraciones × 4 pasos) |
| Base URL | `https://playground.calidadsinhumo.com/api` |

## Comando utilizado

```bash
jmeter -n -t performance/jmeter/qa-store-flow.jmx \
  -l performance/jmeter/results/results.jtl \
  -e -o performance/jmeter/results/html-report \
  -j performance/jmeter/results/jmeter.log
```

## Resultados por endpoint

| Endpoint | Muestras | Error % | Promedio (ms) | p90 (ms) | p95 (ms) | Máx (ms) |
| -------- | -------: | ------: | ------------: | -------: | -------: | -------: |
| 01 - POST Registro | 50 | 0.00% | 376 | 429 | 489 | 1189 |
| 02 - POST Login | 50 | 0.00% | 356 | 420 | 475 | 530 |
| 03 - GET Consulta progreso | 50 | 0.00% | 359 | 417 | 494 | 521 |
| 04 - POST Inscripción | 50 | 0.00% | 366 | 414 | 562 | 690 |
| **TOTAL** | **200** | **0.00%** | **364** | **418** | **475** | **1189** |

## Métricas principales

- **Tiempo promedio de respuesta:** 364 ms (todos los pasos).
- **p95 global:** 475 ms (por debajo del umbral de 800 ms definido en los Quality Gates).
- **Errores encontrados:** 0 de 200 muestras (0.00%).
- **Throughput:** ~12.4 requests/segundo.
- **Assertions:** todas pasaron (status codes 201/200/200 + cuerpo "inscrito").

## Conclusión

**APROBADO.** El flujo completo de QA Store (registro, login, consulta e inscripción)
respondió de forma estable bajo carga de 10 usuarios concurrentes con 0% de errores y
tiempos de respuesta promedio por debajo de 400 ms. El pico máximo (1189 ms en el primer
registro) corresponde al *warm-up* inicial del servidor y no se repite en el resto de las
muestras. El escenario cumple los umbrales de performance definidos.

## Evidencia generada

- `results/results.jtl` — datos crudos de todas las muestras.
- `results/html-report/` — dashboard HTML navegable de JMeter (abrir `index.html`).
- `results/jmeter.log` — log de ejecución.
