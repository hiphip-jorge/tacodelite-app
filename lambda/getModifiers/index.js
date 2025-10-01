const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const getCorsHeaders = (origin) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '*';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
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

        const groupId = event.queryStringParameters?.groupId;

        let result;

        if (groupId) {
            // Get modifiers for a specific group
            const command = new QueryCommand({
                TableName: process.env.DYNAMODB_TABLE,
                KeyConditionExpression: 'pk = :pk',
                ExpressionAttributeValues: {
                    ':pk': `MODIFIER#${groupId}`
                }
            });
            result = await docClient.send(command);
        } else {
            // Get all modifiers
            const command = new ScanCommand({
                TableName: process.env.DYNAMODB_TABLE,
                FilterExpression: 'begins_with(pk, :modifierPrefix) AND begins_with(sk, :modifierPrefix)',
                ExpressionAttributeValues: {
                    ':modifierPrefix': 'MODIFIER#'
                }
            });
            result = await docClient.send(command);
        }

        // Sort by sortOrder within each group
        const modifiers = (result.Items || []).sort((a, b) => {
            if (a.groupId !== b.groupId) {
                return a.groupId.localeCompare(b.groupId);
            }
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify(modifiers)
        };
    } catch (error) {
        console.error('Error fetching modifiers:', error);
        const origin = event.headers?.origin || event.headers?.Origin || '*';
        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                error: 'Failed to fetch modifiers',
                message: error.message
            })
        };
    }
};

