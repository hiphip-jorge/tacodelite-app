const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to get CORS headers
const getCorsHeaders = (origin) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];

    // If origin is in allowed list, return it; otherwise return first allowed origin
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        };
    } else {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigins[0],
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        };
    }
};

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));

        // Get the origin from the request headers
        const origin = event.headers?.origin || event.headers?.Origin || '*';

        // Parse request body - handle both string and object cases
        // When called directly, event contains the data directly
        // When called via API Gateway, event.body contains the JSON string
        const body = event.body ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body) : event;
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'Email and password are required'
                })
            };
        }

        // Query admin user by email
        const params = {
            TableName: process.env.ADMIN_USERS_TABLE,
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email.toLowerCase()
            }
        };

        const result = await dynamodb.send(new QueryCommand(params));

        if (result.Items.length === 0) {
            return {
                statusCode: 401,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid email or password'
                })
            };
        }

        const user = result.Items[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return {
                statusCode: 401,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid email or password'
                })
            };
        }

        // Check if user is active
        if (!user.active) {
            return {
                statusCode: 403,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'Account is deactivated'
                })
            };
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.pk,
                email: user.email,
                role: user.role,
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login
        await dynamodb.send(new UpdateCommand({
            TableName: process.env.ADMIN_USERS_TABLE,
            Key: { pk: user.pk },
            UpdateExpression: 'SET lastLogin = :lastLogin',
            ExpressionAttributeValues: {
                ':lastLogin': new Date().toISOString()
            }
        }));

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                success: true,
                token,
                user: {
                    id: user.pk,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    permissions: user.permissions || []
                }
            })
        };

    } catch (error) {
        console.error('Login error:', error);
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
