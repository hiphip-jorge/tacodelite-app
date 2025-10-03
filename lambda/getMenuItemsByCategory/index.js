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
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
    };
};

exports.handler = async event => {
    try {
        const { categoryId } = event.queryStringParameters || {};

        if (!categoryId) {
            const origin =
                event.headers?.origin || event.headers?.Origin || '*';
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin),
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Category ID parameter is required',
                }),
            };
        }

        const params = {
            TableName: process.env.DYNAMODB_TABLE,
        };

        const command = new ScanCommand(params);
        const result = await docClient.send(command);

        // Filter items by category
        let filteredItems;
        if (categoryId === 'all') {
            filteredItems = result.Items.filter(item => item.active);
        } else {
            filteredItems = result.Items.filter(
                item => item.active && item.categoryId === parseInt(categoryId)
            );
        }

        return {
            statusCode: 200,
            headers: getCorsHeaders(
                event.headers?.origin || event.headers?.Origin || '*'
            ),
            body: JSON.stringify(filteredItems),
        };
    } catch (error) {
        console.error('Error fetching menu items by category:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(
                event.headers?.origin || event.headers?.Origin || '*'
            ),
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
