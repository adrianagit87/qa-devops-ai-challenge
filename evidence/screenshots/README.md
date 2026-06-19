# Capturas de pantalla (evidencia visual)

| Archivo | Qué muestra |
| ------- | ----------- |
| `github-actions-pipeline.png` | Corrida del workflow **QA CI Pipeline** en GitHub Actions con estado **Success** y los 3 jobs en verde (Pruebas automatizadas, Performance K6, Escaneo de secretos) + los artefactos generados. |
| `jmeter-dashboard.png` | Dashboard HTML de **JMeter** del escenario completo: 200 muestras, 0% de errores (gráfico de torta 100% OK) y la tabla de estadísticas por endpoint. |

> Evidencia adicional en formato texto/datos (no captura):
> - `performance/k6/results/` — salida de consola y summary JSON de K6.
> - `performance/jmeter/results/` — `.jtl`, log y reporte HTML navegable de JMeter.
> - Artefactos descargables del pipeline en la pestaña **Actions** de cada corrida.
