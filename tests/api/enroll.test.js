import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { postJson } from '../helpers/config.js';

describe('POST /api/enroll (flujo de compra simulado: inscripción a curso)', () => {
  test('inscripción a un curso válido devuelve 200 y confirma la inscripción', async () => {
    const { status, data } = await postJson('/enroll', { courseId: 'fundamentos' });

    assert.equal(status, 200, 'el status debe ser 200');
    assert.equal(data.status, 'inscrito', 'el estado debe ser "inscrito"');
    assert.match(data.message ?? '', /exitosa/i, 'debe confirmar inscripción exitosa');
  });

  test('la respuesta incluye las métricas del flujo (progress, spotsLeft, timestamp)', async () => {
    const { data } = await postJson('/enroll', { courseId: 'fundamentos' });

    assert.equal(typeof data.progress, 'number', 'progress debe ser numérico');
    assert.equal(typeof data.spotsLeft, 'number', 'spotsLeft debe ser numérico');
    assert.ok(data.enrolledAt, 'debe incluir el timestamp de inscripción');
  });

  test('inscripción sin courseId no completa el flujo de compra', async () => {
    const { status, data } = await postJson('/enroll', {});

    // Documentamos el comportamiento real: si la API lo permite, al menos no debe
    // devolver una inscripción válida sin curso identificado.
    if (status === 200) {
      assert.notEqual(
        data.status,
        'inscrito',
        'no debería marcar como inscrito sin un courseId válido',
      );
    } else {
      assert.ok(status >= 400, 'debe responder con error de cliente');
    }
  });
});
