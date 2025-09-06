const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

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
            'Access-Control-Allow-Methods': 'PUT, OPTIONS'
        };
    } else {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigins[0],
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS'
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

        // Extract user ID from path parameters
        const userId = event.pathParameters?.userId;

        if (!userId) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'User ID is required'
                })
            };
        }

        // Parse request body
        const body = event.body ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body) : {};

        // Validate required fields
        if (!body.email || !body.name) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'Email and name are required'
                })
            };
        }

        // Prepare update expression and attribute values
        const updateExpression = [];
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};

        // Build update expression dynamically based on provided fields
        if (body.email) {
            updateExpression.push('#email = :email');
            expressionAttributeNames['#email'] = 'email';
            expressionAttributeValues[':email'] = body.email;
        }

        if (body.name) {
            updateExpression.push('#name = :name');
            expressionAttributeNames['#name'] = 'name';
            expressionAttributeValues[':name'] = body.name;
        }

        if (body.phone !== undefined) {
            updateExpression.push('phone = :phone');
            expressionAttributeValues[':phone'] = body.phone || '';
        }

        if (body.address !== undefined) {
            updateExpression.push('address = :address');
            expressionAttributeValues[':address'] = body.address || '';
        }

        if (body.preferences !== undefined) {
            updateExpression.push('preferences = :preferences');
            expressionAttributeValues[':preferences'] = body.preferences || {};
        }

        if (body.active !== undefined) {
            updateExpression.push('#active = :active');
            expressionAttributeNames['#active'] = 'active';
            expressionAttributeValues[':active'] = body.active;
        }

        // Add updatedAt timestamp
        updateExpression.push('updatedAt = :updatedAt');
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        // Update user in DynamoDB
        const params = {
            TableName: process.env.USERS_TABLE,
            Key: {
                pk: `USER#${userId}`
            },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        // Add expression attribute names if any
        if (Object.keys(expressionAttributeNames).length > 0) {
            params.ExpressionAttributeNames = expressionAttributeNames;
        }

        const result = await dynamodb.send(new UpdateCommand(params));

        // Transform the response to remove DynamoDB-specific fields
        const updatedUser = {
            id: result.Attributes.pk.replace('USER#', ''),
            email: result.Attributes.email,
            name: result.Attributes.name,
            phone: result.Attributes.phone || '',
            address: result.Attributes.address || '',
            preferences: result.Attributes.preferences || {},
            createdAt: result.Attributes.createdAt,
            lastOrder: result.Attributes.lastOrder,
            active: result.Attributes.active !== false,
            updatedAt: result.Attributes.updatedAt
        };

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                success: true,
                user: updatedUser
            })
        };

    } catch (error) {
        console.error('Update user error:', error);
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
