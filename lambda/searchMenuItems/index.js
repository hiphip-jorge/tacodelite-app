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
        'Cache-Control': 'max-age=604800, public', // 7 days - search is more dynamic
        ETag: 'W/"search-v1"',
        Vary: 'Accept-Encoding',
    };
};

exports.handler = async event => {
    try {
        const { query } = event.queryStringParameters || {};

        if (!query) {
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
                    error: 'Query parameter is required',
                }),
            };
        }

        // Optimized query to get only menu items (exclude modifier data)
        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: 'begins_with(pk, :itemPrefix) AND pk = sk',
            ExpressionAttributeValues: {
                ':itemPrefix': 'ITEM#',
            },
        };

        const command = new ScanCommand(params);
        const result = await docClient.send(command);

        // Clean up menu items to exclude modifier-related fields and ensure consistent structure
        let cleanedItems = result.Items.map(item => ({
            pk: item.pk,
            sk: item.sk,
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            categoryId: item.categoryId,
            vegetarian: item.vegetarian,
            active: item.active,
            // Include any other core fields that exist
            ...(item.img && { img: item.img }),
            ...(item.alt && { alt: item.alt }),
            ...(item.categoryName && { categoryName: item.categoryName }),
            ...(item.createdAt && { createdAt: item.createdAt }),
        }));

        // Filter items based on search query
        const searchTerm = query.toLowerCase();
        const filteredItems = cleanedItems.filter(
            item =>
                item.active &&
                (item.name.toLowerCase().includes(searchTerm) ||
                    (item.description &&
                        item.description.toLowerCase().includes(searchTerm)) ||
                    // Search for vegetarian items (exact match or partial)
                    (searchTerm.includes('vegetarian') &&
                        item.vegetarian === true) ||
                    (searchTerm.includes('vegan') &&
                        item.vegetarian === true) ||
                    // Search for vegetarian field directly
                    (searchTerm === 'vegetarian' && item.vegetarian === true))
        );

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(
                    event.headers?.origin || event.headers?.Origin || '*'
                ),
            },
            body: JSON.stringify({
                success: true,
                data: filteredItems,
                count: filteredItems.length,
                query: query,
            }),
        };
    } catch (error) {
        console.error('Error searching menu items:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(
                    event.headers?.origin || event.headers?.Origin || '*'
                ),
            },
            body: JSON.stringify({
                success: false,
                error: 'Failed to search menu items',
                message: error.message,
            }),
        };
    }
};
