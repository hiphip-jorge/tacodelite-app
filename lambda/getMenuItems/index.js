const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const getCorsHeaders = (origin) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '*';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    };
};

exports.handler = async (event) => {
    try {
        const command = new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: 'begins_with(pk, :itemPrefix)',
            ExpressionAttributeValues: {
                ':itemPrefix': 'ITEM#'
            }
        });

        const result = await docClient.send(command);

        const origin = event.headers?.origin || event.headers?.Origin || '*';
        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify(result.Items)
        };
    } catch (error) {
        console.error('Error:', error);
        const origin = event.headers?.origin || event.headers?.Origin || '*';
        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
