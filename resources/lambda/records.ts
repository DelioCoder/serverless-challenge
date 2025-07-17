import { getCharacters } from "./dynamodb/characters";

export const handler = async (event: any) => {

  const tableName = process.env.TABLE_NAME;

  // Extract specific properties from the event object
  const queryParams = event.queryStringParameters || {};
  const limit = parseInt(queryParams.limit) || 5;
  const page = parseInt(queryParams.page) || 0;

  console.log({limit, page});

  const characters = await getCharacters(tableName!);

  console.log(characters);

  const totalItems = characters?.length || 0;
  const sortedItems = (characters || []).sort((a, b) => b.timestamp - a.timestamp);
  const lastPage = Math.ceil( totalItems! / limit );

  // Pagination
  const start = (page! - 1) * limit!;
  const end = start + limit;
  const paginated = sortedItems.slice(start, end);

  console.log(paginated);

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: paginated,
      meta: {
        page: page,
        total: totalItems,
        lastPage: lastPage
      }
    }),
  };
};