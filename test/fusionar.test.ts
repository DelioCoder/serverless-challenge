import { handler } from '../lambda/combine';

describe('Combine Lambda', () => {
  it('should return 200 and an array of characters with pokemons', async () => {
    const response = await handler({} as any);

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.newStarWarCharacters).toBeDefined();
    expect(Array.isArray(body.newStarWarCharacters)).toBe(true);
    expect(body.newStarWarCharacters.length).toBeGreaterThan(0);
  });
});
