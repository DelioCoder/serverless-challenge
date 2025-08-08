import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import assert from 'assert';
import dotenv from 'dotenv';

dotenv.config();

let token: string | null = null;
let response: any;

Given('que el usuario tiene un token JWT válido', function () {
  token = process.env.ACCESS_TOKEN || null;
});

Given('que el usuario no tiene un token JWT', function () {
  token = null;
});

When('realiza una petición GET al endpoint {string}', async function (endpoint: string) {
  try {
    response = await axios.get(`${process.env.BASE_URL}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  } catch (err: any) {
    response = err.response;
  }
});

Then('la respuesta debe tener código de estado {int}', function (statusCode: number) {
  assert.strictEqual(response.status, statusCode);
});

Then('el cuerpo debe contener {string}', function (field: string) {
  assert.ok(response.data[field] !== undefined);
});
