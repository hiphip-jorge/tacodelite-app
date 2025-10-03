const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
} = require('@aws-sdk/lib-dynamodb');
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
        if (!body.id || !body.name || !body.groupId) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    error: 'Missing required fields: id, name, groupId',
                }),
            };
        }

        // Verify the modifier group exists
        const groupCommand = new GetCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `MODIFIER_GROUP#${body.groupId}`,
                sk: `MODIFIER_GROUP#${body.groupId}`,
            },
        });

        const groupResult = await docClient.send(groupCommand);

        if (!groupResult.Item) {
            return {
                statusCode: 404,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({ error: 'Modifier group not found' }),
            };
        }

        // Generate ID from name if not provided as proper format
        const modifierId = body.id.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

        const now = new Date().toISOString();
        const modifier = {
            pk: `MODIFIER#${body.groupId}`,
            sk: `MODIFIER#${modifierId}`,
            id: modifierId,
            name: body.name,
            groupId: body.groupId,
            groupName: groupResult.Item.name,
            price: parseFloat(body.price) || 0,
            priceType: body.priceType || 'addon', // 'addon' | 'included' | 'removal'
            defaultSelected: body.defaultSelected || false,
            sortOrder: body.sortOrder || 0,
            active: body.active !== undefined ? body.active : true,
            createdAt: now,
            updatedAt: now,
        };

        const command = new PutCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Item: modifier,
            ConditionExpression:
                'attribute_not_exists(pk) OR attribute_not_exists(sk)',
        });

        await docClient.send(command);

        // Log activity
        await logActivity(
            'modifier',
            'created',
            body.name,
            modifierId,
            null, // userId
            null, // userName
            event // Pass event to extract user info from headers
        );

        return {
            statusCode: 201,
            headers: getCorsHeaders(origin),
            body: JSON.stringify(modifier),
        };
    } catch (error) {
        console.error('Error creating modifier:', error);
        const origin = event.headers?.origin || event.headers?.Origin || '*';

        if (error.name === 'ConditionalCheckFailedException') {
            return {
                statusCode: 409,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    error: 'Modifier already exists in this group',
                }),
            };
        }

        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                error: 'Failed to create modifier',
                message: error.message,
            }),
        };
    }
};
