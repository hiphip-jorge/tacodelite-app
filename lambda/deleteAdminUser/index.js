const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

// Helper function to get CORS headers
const getCorsHeaders = (origin) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];

    // If origin is in allowed list, return it; otherwise return first allowed origin
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
        };
    } else {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigins[0],
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
        };
    }
};

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));

        // Get the origin from the request headers
        const origin = event.headers?.origin || event.headers?.Origin || '*';

        // Handle CORS preflight request
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: getCorsHeaders(origin),
                body: ''
            };
        }

        // Extract admin user ID from path parameters
        const userId = event.pathParameters?.id;

        if (!userId) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'Admin user ID is required'
                })
            };
        }

        console.log('🗑️ Deleting admin user:', userId);

        // First, check if admin user exists
        const getParams = {
            TableName: process.env.ADMIN_USERS_TABLE,
            Key: {
                pk: `ADMIN#${userId}`
            }
        };

        const userResult = await dynamodb.send(new GetCommand(getParams));

        if (!userResult.Item) {
            console.log('❌ Admin user not found:', userId);
            return {
                statusCode: 404,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'Admin user not found'
                })
            };
        }

        console.log('📝 Found admin user to delete:', userResult.Item);

        // Delete admin user from DynamoDB
        const deleteParams = {
            TableName: process.env.ADMIN_USERS_TABLE,
            Key: {
                pk: `ADMIN#${userId}`
            }
        };

        await dynamodb.send(new DeleteCommand(deleteParams));

        console.log('✅ Admin user deleted successfully:', userId);

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                success: true,
                message: 'Admin user deleted successfully'
            })
        };

    } catch (error) {
        console.error('❌ Delete admin user error:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                success: false,
                error: 'Failed to delete admin user'
            })
        };
    }
};
