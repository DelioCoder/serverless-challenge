import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { CharacterWithPokemon } from "../interfaces/newCharacter";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface CreateCharacter {
    tableName: string;
    CACHE_KEY: string;
    characters: CharacterWithPokemon[];
}

export const getCache = async (CACHE_KEY: string, tableName: string) => {

    const cache = await docClient.send(new GetCommand({
        TableName: tableName,
        Key: { id: CACHE_KEY }
    }));

    return cache;

}

export const getCharacters = async (tableName: string) => {
    try {
        const command = new ScanCommand({ TableName: tableName });
        const result = await client.send(command);
        const items = result.Items || [];

        const filtered = items.filter(item => item.id !== 'fusionar-cache-v1');

        return filtered as CharacterWithPokemon[];
    } catch (error) {
        console.error(`Error in retrieving data from ${tableName}:`, error);
        throw error;
    }
}

export const insertCharacters = async (tableName: string, data: CharacterWithPokemon) => {

    try {
        await docClient.send(new PutCommand({
            TableName: tableName,
            Item: data
        }));
    } catch (error) {
        console.error(`Error saving to DynamoDB table ${tableName}:`, error);
        throw error;
    }

}

export const updateCharactersCache = async (args: CreateCharacter) => {

    const { CACHE_KEY, tableName, characters } = args;

    await docClient.send(new PutCommand({
        TableName: tableName,
        Item: {
            id: CACHE_KEY,
            timestamp: Date.now(),
            data: characters
        }
    }));
}