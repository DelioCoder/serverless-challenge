import axios from 'axios';

beforeAll(() => {
  process.env.TABLE_NAME = 'CharacterTable';
});


describe('POST /almacenar', () => {
  it('should store user data and return 201', async () => {
    const res = await axios.post(
      `${process.env.BASE_URL}/almacenar`,
      {
        user: 'DavidSD',
        description: 'Este es mi primer post',
      },
      {
        headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` }
      }
    );

    expect(res.status).toBe(200);
  });
});
