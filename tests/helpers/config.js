/**
 * Configuración compartida de los tests de API — Academia Sin Humo.
 *
 * Academia Sin Humo es una academia online de cursos de automatización y QA que,
 * además, funciona como PLAYGROUND de práctica: contiene bugs intencionales para
 * que quien estudia los cace aplicando técnicas de diseño de pruebas (ISTQB).
 *
 * IMPORTANTE (DevSecOps): las credenciales que viven acá son credenciales de DEMO
 * públicas del playground, NO credenciales reales de ningún usuario. Por eso es
 * seguro versionarlas. Cualquier dato sensible real debe ir por variables de
 * entorno / GitHub Secrets, jamás hardcodeado.
 */

export const BASE_URL =
  process.env.QA_BASE_URL ?? 'https://playground.calidadsinhumo.com/api';

/** Credenciales de demo válidas (usuario seed del playground). */
export const VALID_USER = {
  email: process.env.QA_USER_EMAIL ?? 'ana.garcia@ejemplo.com',
  password: process.env.QA_USER_PASSWORD ?? 'Segura2026!',
};

/** Credenciales inválidas para pruebas negativas. */
export const INVALID_USER = {
  email: 'no.existe@ejemplo.com',
  password: 'ContraseñaIncorrecta1',
};

/**
 * Cursos reales del catálogo (GET /api/courses).
 * `prerequisiteId` define el árbol de dependencias entre cursos.
 */
export const COURSES = {
  fundamentos: { id: 'fundamentos', prerequisiteId: null }, // curso raíz, sin prerequisito
  playwrightCero: { id: 'playwright-cero', prerequisiteId: 'fundamentos' },
  apiTesting: { id: 'api-testing', prerequisiteId: 'playwright-cero', lleno: true }, // 20/20 cupos
};

/** Reglas de validación según la spec de la app (para documentar bugs). */
export const SPEC = {
  password: { min: 8, max: 64 }, // REQ-R04
  age: { min: 16, max: 99 },
  login: { maxAttempts: 5, lockoutSeconds: 30 }, // REQ-L03
};

/** Genera un email único para no chocar al registrar usuarios nuevos. */
export function uniqueEmail(prefix = 'qa.reto5') {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return `${prefix}.${stamp}@ejemplo.com`;
}

/** Helper de POST JSON sobre la API. */
export async function postJson(path, body, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  const setCookie = res.headers.getSetCookie?.() ?? [];
  return { status: res.status, data, setCookie };
}

/** Helper de GET JSON sobre la API. */
export async function getJson(path, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

/**
 * Cliente con cookie de sesión persistente. La API mantiene el contador de
 * intentos de login por sesión (cookie), así que para reproducir el rate-limit
 * (bug L-1) necesitamos reusar la misma cookie entre requests.
 */
export function sessionClient() {
  let cookie = '';
  return {
    async post(path, body) {
      const headers = { 'Content-Type': 'application/json' };
      if (cookie) headers.Cookie = cookie;
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const setCookie = res.headers.getSetCookie?.() ?? [];
      if (setCookie.length) cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    },
  };
}
