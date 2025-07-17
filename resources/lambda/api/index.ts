import axios from 'axios';
import { StarWarsResponse } from '../interfaces/swars-response';
import { PokemonResponse } from '../interfaces/poke-response';

export const getCharactersFromStarWars = async (): Promise<StarWarsResponse[]> => {
  const { data } = await axios.get<StarWarsResponse[]>(`https://swapi.info/api/people`);
  return data ? data.slice(0, 10) : [];
}

export const getPokemons = async (): Promise<PokemonResponse> => {
  const { data } = await axios.get<PokemonResponse>(`https://pokeapi.co/api/v2/pokemon?limit=10&offset=0`);
  return data;
}