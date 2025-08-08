import axios from 'axios';

beforeAll(() => {
  process.env.TABLE_NAME = 'CharacterTable';
});


describe('GET /historial', () => {
  it('Debe retornar codigo 200 y regresar lista de personajes', async () => {
    const { data } = await axios.get(`${process.env.BASE_URL}/historial?limit=5&page=1`,
      {
        headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` }
      }
    );

    expect(Array.isArray(data.data)).toBe(true);
  });

  it('Debe fallar la petición si no hay token y obtener codigo 401', async () => {
    try {
      await axios.get(`${process.env.BASE_URL}/historial`);
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});
