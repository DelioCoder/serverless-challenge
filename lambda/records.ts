import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event: any) => {
  // Extract specific properties from the event object
  const queryParams = event.queryStringParameters || {};
  const limit = parseInt(queryParams.limit) || 5;
  const page = parseInt(queryParams.page) || 0;

  const scanResult = await docClient.send(new ScanCommand({
    TableName: 'CharacterTable',
  }));

  const totalItems = scanResult.Items?.length || 0;
  const sortedItems = (scanResult.Items || []).sort((a, b) => b.timestamp - a.timestamp);
  const lastPage = Math.ceil( totalItems! / limit );

  // Pagination
  const start = (page! - 1) * limit!;
  const end = start + totalItems;
  const paginated = sortedItems.slice(start, end);

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