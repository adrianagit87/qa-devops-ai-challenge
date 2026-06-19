/**
 * Tests de caza de bugs — Academia Sin Humo.
 *
 * Estos tests afirman el comportamiento CORRECTO según la especificación de la app.
 * Como la app tiene bugs intencionales, fallan a propósito. Se marcan como `todo`
 * (defecto conocido) para DOCUMENTAR la falla sin romper el pipeline: node:test
 * reporta los `todo` como pendientes, no como fallos que tumben los Quality Gates.
 *
 * Cada bug está además documentado en docs/hallazgos.md con su evidencia.
 * Si la app se corrige, quitar el `todo` y el test debe pasar en verde (regresión).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  postJson,
  uniqueEmail,
  sessionClient,
  SPEC,
  COURSES,
} from '../helpers/config.js';

describe('Caza de bugs (defectos conocidos — REQ violados)', () => {
  // ── Registro ──────────────────────────────────────────────────────────────
  test(
    'BUG R-1 — REQ-R04: password de 65 caracteres debe rechazarse (máx 64)',
    { todo: 'La validación usa > 65 en vez de > 64; un password de 65 chars pasa.' },
    async () => {
      const password = 'a'.repeat(SPEC.password.max + 1); // 65
      const { status } = await postJson('/register', {
        name: 'Test Limite',
        email: uniqueEmail('qa.r1'),
        password,
        age: '25',
      });
      assert.equal(status, 422, 'un password de 65 caracteres debe ser rechazado');
    },
  );

  test(
    'BUG R-2 — REQ-R03: email sin dominio ("usuario@") debe rechazarse',
    { todo: 'La regex es /.+@.*/ en vez de /.+@.+\\..+/; acepta emails sin dominio.' },
    async () => {
      const { status } = await postJson('/register', {
        name: 'Test Email',
        email: 'usuario@',
        password: 'Holamundo1123',
        age: '25',
      });
      assert.equal(status, 422, 'un email sin dominio debe ser rechazado');
    },
  );

  // ── Login / seguridad ─────────────────────────────────────────────────────
  test(
    'BUG L-1 — REQ-L03: la cuenta debe bloquearse al 5º intento, no al 4º',
    { todo: 'El rate-limit compara con MAX_ATTEMPTS-1 (4); bloquea un intento antes.' },
    async () => {
      const client = sessionClient();
      const bad = { email: 'no.existe@ejemplo.com', password: 'malo123' };
      let cuarto;
      for (let i = 1; i <= 4; i++) {
        cuarto = await client.post('/login', bad);
      }
      // Comportamiento correcto: al 4º intento todavía NO debe estar bloqueada (429).
      assert.notEqual(cuarto.status, 429, 'no debería bloquear antes del 5º intento');
    },
  );

  test(
    'BUG L-2 — REQ-L04: unlockIn reportado debe coincidir con el lockout real (30s)',
    { todo: 'unlockIn reporta 5s menos que el bloqueo real (dice 25 cuando son 30).' },
    async () => {
      const client = sessionClient();
      const bad = { email: 'no.existe2@ejemplo.com', password: 'malo123' };
      let locked;
      for (let i = 1; i <= 5; i++) {
        locked = await client.post('/login', bad);
      }
      if (locked.data?.unlockIn !== undefined) {
        assert.equal(
          locked.data.unlockIn,
          SPEC.login.lockoutSeconds,
          'unlockIn debe coincidir con el lockout real de 30s',
        );
      }
    },
  );

  // ── Inscripción / reglas de negocio ───────────────────────────────────────
  test(
    'BUG I-1 — REQ-A02: la API debe rechazar inscribirse sin el prerequisito',
    { todo: 'POST /api/enroll no valida prerequisitos del lado del servidor.' },
    async () => {
      // 'playwright-cero' requiere completar 'fundamentos' primero.
      const { status } = await postJson('/enroll', {
        courseId: COURSES.playwrightCero.id,
      });
      assert.equal(
        status,
        403,
        'inscribirse sin prerequisito debe devolver 403 Forbidden',
      );
    },
  );

  test(
    'BUG I-3 — REQ-C05: en un curso lleno, displayStatus debe reflejar "lista-espera"',
    { todo: 'status es "lista-espera" pero displayStatus dice "inscrito" (inconsistente).' },
    async () => {
      // 'api-testing' está lleno (20/20): la inscripción cae en lista de espera.
      const { data } = await postJson('/enroll', { courseId: COURSES.apiTesting.id });
      if (data.status === 'lista-espera') {
        assert.equal(
          data.displayStatus,
          'lista-espera',
          'displayStatus debe coincidir con el estado real (lista-espera)',
        );
      }
    },
  );
});
