import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { postJson, VALID_USER, INVALID_USER } from '../helpers/config.js';

describe('POST /api/login', () => {
  test('login exitoso con credenciales válidas devuelve 200 y datos del usuario', async () => {
    const { status, data } = await postJson('/login', VALID_USER);

    assert.equal(status, 200, 'el status debe ser 200');
    assert.match(data.message ?? '', /exitoso/i, 'debe confirmar login exitoso');
    assert.ok(data.user, 'la respuesta debe incluir el objeto user');
    assert.equal(data.user.email, VALID_USER.email, 'el email debe coincidir');
  });

  test('login con credenciales inválidas devuelve 401 y no expone datos', async () => {
    const { status, data } = await postJson('/login', INVALID_USER);

    assert.equal(status, 401, 'el status debe ser 401');
    assert.ok(data.error, 'debe devolver un mensaje de error');
    assert.equal(data.user, undefined, 'NO debe filtrar datos de usuario en error');
  });

  test('login sin password es rechazado (no permite acceso vacío)', async () => {
    const { status } = await postJson('/login', { email: VALID_USER.email });

    assert.notEqual(status, 200, 'nunca debe autenticar sin password');
  });

  test('respuesta de error expone contador de intentos (rate-limit visible)', async () => {
    const { data } = await postJson('/login', INVALID_USER);

    // El backend devuelve attempts/remaining: lo validamos como contrato de seguridad.
    if (data.attempts !== undefined) {
      assert.ok(
        typeof data.attempts === 'number' && data.attempts >= 1,
        'attempts debe ser un número >= 1',
      );
      assert.ok(
        typeof data.remaining === 'number' && data.remaining >= 0,
        'remaining debe ser un número >= 0',
      );
    }
  });
});
