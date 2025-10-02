const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { logActivity } = require('./shared/logActivity');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const getCorsHeaders = (origin) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '*';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
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

        const modifierId = event.pathParameters?.id;
        const groupId = event.queryStringParameters?.groupId;

        if (!modifierId || !groupId) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({ error: 'Missing modifier ID or group ID' })
            };
        }

        // Delete the modifier
        const deleteCommand = new DeleteCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `MODIFIER#${groupId}`,
                sk: `MODIFIER#${modifierId}`
            },
            ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
            ReturnValues: 'ALL_OLD'
        });

        const result = await docClient.send(deleteCommand);

        // Log activity
        await logActivity(
            'modifier',
            'deleted',
            result.Attributes?.name || 'Unknown Modifier',
            modifierId,
            null, // userId
            null, // userName
            event // Pass event to extract user info from headers
        );

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                message: 'Modifier deleted successfully',
                deletedItem: result.Attributes
            })
        };
    } catch (error) {
        console.error('Error deleting modifier:', error);
        const origin = event.headers?.origin || event.headers?.Origin || '*';

        if (error.name === 'ConditionalCheckFailedException') {
            return {
                statusCode: 404,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({ error: 'Modifier not found' })
            };
        }

        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                error: 'Failed to delete modifier',
                message: error.message
            })
        };
    }
};

