/**
 * Configuración compartida de los tests de API.
 *
 * IMPORTANTE (DevSecOps): las credenciales que viven acá son credenciales
 * de DEMO públicas del playground de la academia, NO credenciales reales de
 * ningún usuario. Por eso es seguro versionarlas. Cualquier dato sensible
 * real debe ir por variables de entorno / GitHub Secrets, jamás hardcodeado.
 */

export const BASE_URL =
  process.env.QA_BASE_URL ?? 'https://playground.calidadsinhumo.com/api';

/** Credenciales de demo válidas (públicas, provistas por la academia). */
export const VALID_USER = {
  email: process.env.QA_USER_EMAIL ?? 'ana.garcia@ejemplo.com',
  password: process.env.QA_USER_PASSWORD ?? 'Segura2026!',
};

/** Credenciales inválidas para pruebas negativas. */
export const INVALID_USER = {
  email: 'no.existe@ejemplo.com',
  password: 'ContraseñaIncorrecta1',
};

/** Genera un email único para no chocar al registrar usuarios nuevos. */
export function uniqueEmail(prefix = 'qa.reto5') {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return `${prefix}.${stamp}@ejemplo.com`;
}

/** Helper de POST JSON sobre la API. */
export async function postJson(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

/** Helper de GET JSON sobre la API. */
export async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}
