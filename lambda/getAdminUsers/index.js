const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

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
            'Access-Control-Allow-Methods': 'GET, OPTIONS'
        };
    } else {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigins[0],
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET, OPTIONS'
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

        // Scan the admin users table to get all admin users
        const params = {
            TableName: process.env.ADMIN_USERS_TABLE,
            FilterExpression: 'begins_with(pk, :adminPrefix)',
            ExpressionAttributeValues: {
                ':adminPrefix': 'ADMIN#'
            }
        };

        const result = await dynamodb.send(new ScanCommand(params));

        // Transform the data to remove DynamoDB-specific fields and format for frontend
        const adminUsers = result.Items.map(item => ({
            id: item.pk.replace('ADMIN#', ''),
            email: item.email,
            name: item.name,
            role: item.role || 'admin',
            active: item.active !== false, // Default to true if not specified
            permissions: item.permissions || [], // Include permissions
            createdAt: item.createdAt,
            lastLogin: item.lastLogin
        }));

        // Sort by creation date (newest first)
        adminUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify(adminUsers)
        };

    } catch (error) {
        console.error('Get admin users error:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};
