const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
        };
    } else {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigins[0],
            'Access-Control-Allow-Headers':
                'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

        // Get user from DynamoDB
        const params = {
            TableName: process.env.USERS_TABLE,
            Key: {
                pk: `USER#${userId}`,
            },
        };

        const result = await dynamodb.get(params).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'User not found',
                }),
            };
        }

        // Transform the data to remove DynamoDB-specific fields and format for frontend
        const user = {
            id: result.Item.pk.replace('USER#', ''),
            email: result.Item.email,
            name: result.Item.name,
            phone: result.Item.phone || '',
            address: result.Item.address || '',
            preferences: result.Item.preferences || {},
            createdAt: result.Item.createdAt,
            lastOrder: result.Item.lastOrder,
            active: result.Item.active !== false, // Default to true if not specified
        };

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify(user),
        };
    } catch (error) {
        console.error('Get user error:', error);
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
