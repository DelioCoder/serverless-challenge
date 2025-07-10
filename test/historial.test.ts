import axios from 'axios';

describe('GET /record', () => {
  it('Debe retornar codigo 200 y regresar lista de personajes', async () => {
    const { data } = await axios.get(`${process.env.BASE_URL}/record`, {
      headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` }
    });

    expect(Array.isArray(data.data)).toBe(true);
  });

  it('Debe fallar la petición si no hay token y obtener codigo 401', async () => {
    try {
      await axios.get(`${process.env.BASE_URL}/record`);
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});
