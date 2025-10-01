const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

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

        const groupId = event.pathParameters?.id;

        if (!groupId) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({ error: 'Missing modifier group ID' })
            };
        }

        // Check if there are modifiers in this group
        const queryCommand = new QueryCommand({
            TableName: process.env.DYNAMODB_TABLE,
            KeyConditionExpression: 'pk = :pk',
            ExpressionAttributeValues: {
                ':pk': `MODIFIER#${groupId}`
            },
            Limit: 1
        });

        const queryResult = await docClient.send(queryCommand);

        if (queryResult.Items && queryResult.Items.length > 0) {
            return {
                statusCode: 409,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    error: 'Cannot delete modifier group with existing modifiers',
                    message: 'Please delete all modifiers in this group first'
                })
            };
        }

        // Delete the modifier group
        const deleteCommand = new DeleteCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `MODIFIER_GROUP#${groupId}`,
                sk: `MODIFIER_GROUP#${groupId}`
            },
            ConditionExpression: 'attribute_exists(pk)',
            ReturnValues: 'ALL_OLD'
        });

        const result = await docClient.send(deleteCommand);

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                message: 'Modifier group deleted successfully',
                deletedItem: result.Attributes
            })
        };
    } catch (error) {
        console.error('Error deleting modifier group:', error);
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
                error: 'Failed to delete modifier group',
                message: error.message
            })
        };
    }
};

