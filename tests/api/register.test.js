import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { postJson, uniqueEmail } from '../helpers/config.js';

describe('POST /api/register', () => {
  test('registro exitoso con datos válidos devuelve 201', async () => {
    const nuevo = {
      name: 'Test QA',
      email: uniqueEmail(),
      password: 'Holamundo1123',
      age: '23',
    };
    const { status, data } = await postJson('/register', nuevo);

    assert.equal(status, 201, 'el status debe ser 201 Created');
    assert.match(data.message ?? '', /exitoso/i, 'debe confirmar registro exitoso');
    assert.equal(data.user.email, nuevo.email, 'el email registrado debe coincidir');
  });

  test('registro sin campos obligatorios devuelve 422 con errores por campo', async () => {
    const { status, data } = await postJson('/register', {
      name: 'Test QA',
      email: 'sinpass@ejemplo.com',
    });

    assert.equal(status, 422, 'el status debe ser 422 Unprocessable Entity');
    assert.ok(data.errors, 'debe devolver el detalle de errores');
    assert.ok(data.errors.password, 'debe indicar que falta el password');
    assert.ok(data.errors.age, 'debe indicar que falta la edad');
  });

  test('registro con body vacío no crea usuario', async () => {
    const { status } = await postJson('/register', {});

    assert.notEqual(status, 201, 'nunca debe crear un usuario sin datos');
  });
});
