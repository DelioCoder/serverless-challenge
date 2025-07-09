import { v4 as uuid } from 'uuid';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { StoreDto } from './dto/store.dto';
import { PostDB } from './interfaces/post-db';
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
exports.handler = async (event: any) => {
  // Extract specific properties from the event object
  const { body } = event;

  try {
    if (!body) {
      return {
        body: JSON.stringify({ error: 'There is no body' }),
        statusCode: 400,
      };
    }

    const input = JSON.parse(event.body);
    const dto = plainToInstance(StoreDto, input);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true })

    if (errors.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Validation failed', details: errors })
      }
    }

    const item: PostDB = {
      id: uuid(),
      timestamp: Date.now(),
      ...dto
    }

    await docClient.send(new PutCommand({
      TableName: 'PostTable',
      Item: item
    }));

    return {
      body: JSON.stringify({ message: 'Stored Successfully' }),
      statusCode: 200,
    };
  } catch (error: any) {
    console.error(error.message);
    handleExceptions(error.message, 500)
  }

};

const handleExceptions = (body: string, statusCode: number) => {

  return {
    body: JSON.stringify({ message: body }),
    statusCode: statusCode,
  };

}