import { v4 as uuid } from 'uuid';
import { CharacterWithPokemon } from './interfaces/newCharacter';
import { getCache, insertCharacters, updateCharactersCache } from './dynamodb/characters';
import { getCharactersFromStarWars, getPokemons } from './api';

export const handler = async (event: any) => {

  try {

    const CACHE_KEY = 'fusionar-cache-v1';
    const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

    const tableName = process.env.TABLE_NAME;

    const cache = await getCache(CACHE_KEY, tableName!);

    if (cache.Item && Date.now() - cache.Item.timestamp < CACHE_TTL_MS) {
      console.log('Usando caché');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStarWarCharacters: cache.Item.data, fromCache: true })
      };
    }

    const pokemonArray = await getPokemons();
    const starWarsCharactersArray = await getCharactersFromStarWars();

    const newStarWarCharacters: CharacterWithPokemon[] = starWarsCharactersArray?.map((character, index) => {
      const pokemon = pokemonArray.results[index];
      return {
        id: uuid(),
        timestamp: Date.now(),
        name: character.name,
        homeworld: character.homeworld,
        pokemon: pokemon.name
      }
    });

    await Promise.all(newStarWarCharacters.map(character =>
      insertCharacters(tableName!, character)
    ));

    await updateCharactersCache({ tableName: tableName!, CACHE_KEY, characters: newStarWarCharacters });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStarWarCharacters })
    }
  } catch (error: any) {
    console.error(error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error combining data' })
    };
  }

};