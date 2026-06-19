import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getJson } from '../helpers/config.js';

describe('GET /api/progress', () => {
  test('consulta de progreso devuelve 200 con estructura esperada', async () => {
    const { status, data } = await getJson('/progress');

    assert.equal(status, 200, 'el status debe ser 200');
    assert.ok(Array.isArray(data.enrollments), 'enrollments debe ser un array');
    assert.equal(
      typeof data.total,
      'number',
      'total debe ser un número (contrato de la API)',
    );
  });

  test('el total es coherente con la cantidad de enrollments', async () => {
    const { data } = await getJson('/progress');

    assert.equal(
      data.total,
      data.enrollments.length,
      'total debe coincidir con la longitud de enrollments',
    );
  });
});
