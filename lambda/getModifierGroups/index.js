const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

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
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
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

        // Get all modifier groups
        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: 'begins_with(pk, :groupPrefix)',
            ExpressionAttributeValues: {
                ':groupPrefix': 'MODIFIER_GROUP#',
            },
        };

        const command = new ScanCommand(params);
        const result = await docClient.send(command);

        // Sort by sortOrder
        const modifierGroups = (result.Items || []).sort(
            (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify(modifierGroups),
        };
    } catch (error) {
        console.error('Error fetching modifier groups:', error);
        const origin = event.headers?.origin || event.headers?.Origin || '*';
        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                error: 'Failed to fetch modifier groups',
                message: error.message,
            }),
        };
    }
};
