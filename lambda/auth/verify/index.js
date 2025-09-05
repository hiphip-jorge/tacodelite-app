const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
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
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        };
    } else {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigins[0],
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        };
    }
};

exports.handler = async (event) => {
    try {
        // Get the origin from the request headers
        const origin = event.headers?.origin || event.headers?.Origin || '*';

        // Get token from Authorization header
        const authHeader = event.headers.Authorization || event.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'No valid authorization token provided'
                })
            };
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (jwtError) {
            return {
                statusCode: 401,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid or expired token'
                })
            };
        }

        // Get user from database to ensure they still exist and are active
        const params = {
            TableName: process.env.ADMIN_USERS_TABLE,
            Key: {
                pk: decoded.userId
            }
        };

        const result = await dynamodb.get(params).promise();

        if (!result.Item) {
            return {
                statusCode: 401,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'User not found'
                })
            };
        }

        const user = result.Item;

        // Check if user is still active
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

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                success: true,
                user: {
                    id: user.pk,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    lastLogin: user.lastLogin
                }
            })
        };

    } catch (error) {
        console.error('Token verification error:', error);
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
