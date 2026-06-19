/**
 * Prueba de performance con K6 — Login de Academia Sin Humo.
 *
 * Objetivo: validar que POST /api/login responde correctamente bajo carga,
 * medir tiempos de respuesta y hacer cumplir thresholds de aceptación.
 *
 * Ejecución:
 *   k6 run performance/k6/login-load-test.js
 *
 * Salida de evidencia (JSON resumen):
 *   k6 run --summary-export performance/k6/results/login-summary.json \
 *          performance/k6/login-load-test.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métricas personalizadas para la evidencia.
const loginErrors = new Rate('login_errors');
const loginDuration = new Trend('login_duration', true);

const BASE_URL = __ENV.QA_BASE_URL || 'https://playground.calidadsinhumo.com/api';

// Credenciales de DEMO públicas (no son de un usuario real).
const VALID_USER = {
  email: __ENV.QA_USER_EMAIL || 'ana.garcia@ejemplo.com',
  password: __ENV.QA_USER_PASSWORD || 'Segura2026!',
};

export const options = {
  // Escenario de carga: rampa de subida, meseta y bajada.
  stages: [
    { duration: '20s', target: 10 }, // sube a 10 usuarios virtuales
    { duration: '30s', target: 10 }, // mantiene la carga
    { duration: '10s', target: 0 },  // baja
  ],
  // Quality Gates de performance — si no se cumplen, k6 sale con código != 0.
  thresholds: {
    // Tiempo de respuesta: p95 por debajo de 800ms.
    http_req_duration: ['p(95)<800'],
    // Tasa de errores de login < 1% (criterio del reto).
    login_errors: ['rate<0.01'],
    // Menos del 1% de requests fallidas a nivel HTTP.
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const payload = JSON.stringify(VALID_USER);
  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(`${BASE_URL}/login`, payload, params);

  // Validamos contrato funcional bajo carga.
  const ok = check(res, {
    'status es 200': (r) => r.status === 200,
    'respuesta confirma login exitoso': (r) => r.body && r.body.includes('exitoso'),
    'responde en menos de 1s': (r) => r.timings.duration < 1000,
  });

  loginErrors.add(!ok);
  loginDuration.add(res.timings.duration);

  sleep(1); // think time entre iteraciones de cada usuario virtual
}
