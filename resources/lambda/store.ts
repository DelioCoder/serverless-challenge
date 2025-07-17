import { v4 as uuid } from 'uuid';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { PostDB } from './interfaces/post-db';
import { StoreDto } from './dto/store.dto';
import { createPost } from './dynamodb/post';

export const handler = async (event: any) => {
  // Extract specific properties from the event object
  const { body } = event;

  const tableName = process.env.TABLE_NAME;

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

    await createPost(item, tableName!);

    return {
      body: JSON.stringify({ message: 'Post stored Successfully' }),
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