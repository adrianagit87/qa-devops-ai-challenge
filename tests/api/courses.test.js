import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getJson } from '../helpers/config.js';

describe('GET /api/courses (catálogo de cursos)', () => {
  test('devuelve 200 con la lista de cursos y el total', async () => {
    const { status, data } = await getJson('/courses');

    assert.equal(status, 200, 'el status debe ser 200');
    assert.ok(Array.isArray(data.courses), 'courses debe ser un array');
    assert.equal(typeof data.total, 'number', 'total debe ser numérico');
    assert.equal(data.total, data.courses.length, 'total debe coincidir con la lista');
  });

  test('cada curso expone el contrato esperado (id, title, level, prerequisiteId)', async () => {
    const { data } = await getJson('/courses');
    const curso = data.courses.find((c) => c.id === 'fundamentos');

    assert.ok(curso, 'debe existir el curso "fundamentos"');
    assert.equal(curso.title, 'Fundamentos de Testing');
    assert.equal(curso.prerequisiteId, null, 'fundamentos es curso raíz, sin prerequisito');
    assert.ok(['principiante', 'intermedio', 'avanzado'].includes(curso.level));
  });

  test('el catálogo incluye los 3 cursos reales con contenido', async () => {
    const { data } = await getJson('/courses');
    const reales = ['playwright-cazador-bugs', 'ia-para-qa', 'api-cazador-bugs'];

    for (const id of reales) {
      assert.ok(
        data.courses.some((c) => c.id === id),
        `el catálogo debe incluir el curso real "${id}"`,
      );
    }
  });
});
