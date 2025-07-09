import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { PokemonResponse } from './interfaces/poke-response';
import { StarWarsResponse } from './interfaces/swars-response';
import { CharacterWithPokemon } from './interfaces/newCharacter';

const API_BASE_URL_1 = `https://swapi.info/api`;
const API_BASE_URL_2 = `https://pokeapi.co/api`;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CACHE_KEY = 'combined-v1';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

exports.handler = async (event: any) => {

  try {

    const cache = await docClient.send(new GetCommand({
      TableName: 'CharacterTable',
      Key: { id: CACHE_KEY }
    }));

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
    })

    await Promise.all(newStarWarCharacters.map(character => (
      docClient.send(new PutCommand({
        TableName: 'CharacterTable',
        Item: character
      }))
    )))

    await docClient.send(new PutCommand({
      TableName: 'CharacterTable',
      Item: {
        id: CACHE_KEY,
        timestamp: Date.now(),
        data: newStarWarCharacters
      }
    }));

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

const getPokemons = async (): Promise<PokemonResponse> => {
  const { data } = await axios.get<PokemonResponse>(`${API_BASE_URL_2}/v2/pokemon?limit=10&offset=0`);
  return data;
}

const getCharactersFromStarWars = async (): Promise<StarWarsResponse[]> => {
  const { data } = await axios.get<StarWarsResponse[]>(`${API_BASE_URL_1}/people`);
  return data ? data.slice(0, 10) : [];
}