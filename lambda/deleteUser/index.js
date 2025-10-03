const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    GetCommand,
    DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

// Helper function to get CORS headers
const getCorsHeaders = origin => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['*'];

    // If origin is in allowed list, return it; otherwise return first allowed origin
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers':
                'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        };
    } else {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigins[0],
            'Access-Control-Allow-Headers':
                'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        };
    }
};

exports.handler = async event => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));

        // Get the origin from the request headers
        const origin = event.headers?.origin || event.headers?.Origin || '*';

        // Handle CORS preflight request
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: getCorsHeaders(origin),
                body: '',
            };
        }

        // Extract user ID from path parameters
        const userId = event.pathParameters?.userId;

        if (!userId) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'User ID is required',
                }),
            };
        }

        // First, check if user exists
        const getParams = {
            TableName: process.env.USERS_TABLE,
            Key: {
                pk: `USER#${userId}`,
            },
        };

        const userResult = await dynamodb.send(new GetCommand(getParams));

        if (!userResult.Item) {
            return {
                statusCode: 404,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'User not found',
                }),
            };
        }

        // Delete user from DynamoDB
        const deleteParams = {
            TableName: process.env.USERS_TABLE,
            Key: {
                pk: `USER#${userId}`,
            },
        };

        await dynamodb.send(new DeleteCommand(deleteParams));

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                success: true,
                message: 'User deleted successfully',
            }),
        };
    } catch (error) {
        console.error('Delete user error:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                success: false,
                error: 'Internal server error',
            }),
        };
    }
};
