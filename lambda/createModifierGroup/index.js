const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { logActivity } = require('./shared/logActivity');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

const getCorsHeaders = origin => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    const allowedOrigin = allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0] || '*';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers':
            'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Content-Type': 'application/json',
    };
};

exports.handler = async event => {
    try {
        const origin = event.headers?.origin || event.headers?.Origin || '*';

        // Handle preflight requests
        if (
            event.requestContext?.http?.method === 'OPTIONS' ||
            event.httpMethod === 'OPTIONS'
        ) {
            return {
                statusCode: 200,
                headers: getCorsHeaders(origin),
                body: '',
            };
        }

        const body =
            typeof event.body === 'string'
                ? JSON.parse(event.body)
                : event.body;

        // Validate required fields
        if (!body.id || !body.name) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    error: 'Missing required fields: id, name',
                }),
            };
        }

        // Generate ID from name if not provided as proper format
        const groupId = body.id.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

        const now = new Date().toISOString();
        const modifierGroup = {
            pk: `MODIFIER_GROUP#${groupId}`,
            sk: `MODIFIER_GROUP#${groupId}`,
            id: groupId,
            name: body.name,
            description: body.description || '',
            sortOrder: body.sortOrder || 0,
            active: body.active !== undefined ? body.active : true,
            createdAt: now,
            updatedAt: now,
        };

        const command = new PutCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Item: modifierGroup,
            ConditionExpression: 'attribute_not_exists(pk)',
        });

        await docClient.send(command);

        // Log activity
        await logActivity(
            'modifier_group',
            'created',
            body.name,
            groupId,
            null, // userId
            null, // userName
            event // Pass event to extract user info from headers
        );

        return {
            statusCode: 201,
            headers: getCorsHeaders(origin),
            body: JSON.stringify(modifierGroup),
        };
    } catch (error) {
        console.error('Error creating modifier group:', error);
        const origin = event.headers?.origin || event.headers?.Origin || '*';

        if (error.name === 'ConditionalCheckFailedException') {
            return {
                statusCode: 409,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    error: 'Modifier group already exists',
                }),
            };
        }

        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                error: 'Failed to create modifier group',
                message: error.message,
            }),
        };
    }
};
