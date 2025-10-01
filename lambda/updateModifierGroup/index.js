const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const getCorsHeaders = (origin) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '*';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        'Content-Type': 'application/json'
    };
};

exports.handler = async (event) => {
    try {
        const origin = event.headers?.origin || event.headers?.Origin || '*';

        // Handle preflight requests
        if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: getCorsHeaders(origin),
                body: ''
            };
        }

        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const groupId = event.pathParameters?.id || body.id;

        if (!groupId) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({ error: 'Missing modifier group ID' })
            };
        }

        // Build update expression
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        if (body.name !== undefined) {
            updateExpressions.push('#name = :name');
            expressionAttributeNames['#name'] = 'name';
            expressionAttributeValues[':name'] = body.name;
        }

        if (body.description !== undefined) {
            updateExpressions.push('#description = :description');
            expressionAttributeNames['#description'] = 'description';
            expressionAttributeValues[':description'] = body.description;
        }

        if (body.sortOrder !== undefined) {
            updateExpressions.push('#sortOrder = :sortOrder');
            expressionAttributeNames['#sortOrder'] = 'sortOrder';
            expressionAttributeValues[':sortOrder'] = body.sortOrder;
        }

        if (body.active !== undefined) {
            updateExpressions.push('#active = :active');
            expressionAttributeNames['#active'] = 'active';
            expressionAttributeValues[':active'] = body.active;
        }

        // Always update updatedAt
        updateExpressions.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        if (updateExpressions.length === 1) { // Only updatedAt
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({ error: 'No fields to update' })
            };
        }

        const command = new UpdateCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `MODIFIER_GROUP#${groupId}`,
                sk: `MODIFIER_GROUP#${groupId}`
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
            ConditionExpression: 'attribute_exists(pk)'
        });

        const result = await docClient.send(command);

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify(result.Attributes)
        };
    } catch (error) {
        console.error('Error updating modifier group:', error);
        const origin = event.headers?.origin || event.headers?.Origin || '*';

        if (error.name === 'ConditionalCheckFailedException') {
            return {
                statusCode: 404,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({ error: 'Modifier group not found' })
            };
        }

        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                error: 'Failed to update modifier group',
                message: error.message
            })
        };
    }
};

