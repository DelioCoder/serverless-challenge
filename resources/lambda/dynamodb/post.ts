import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PostDB } from '../interfaces/post-db';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const createPost = async (item: PostDB, tableName: string) => {
    try {
        await docClient.send(new PutCommand({
            TableName: tableName,
            Item: item
        }));
    } catch (error) {
        console.error(`Error saving to DynamoDB table ${tableName}:`, error);
        throw error;
    }
}