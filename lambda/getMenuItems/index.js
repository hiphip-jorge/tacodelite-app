const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    ScanCommand,
    GetCommand,
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

// Helper function to get current menu version
async function getMenuVersion() {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: 'MENU_VERSION',
                sk: 'MENU_VERSION',
            },
        };

        const command = new GetCommand(params);
        const response = await docClient.send(command);
        return response.Item?.version || 1;
    } catch (error) {
        console.error('Error getting menu version:', error);
        return 1; // Default version
    }
}

// Helper function to generate ETag from data
function generateETag(data) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

const getCorsHeaders = (origin, additionalHeaders = {}) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    const allowedOrigin = allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0] || '*';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers':
            'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,If-None-Match',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        ...additionalHeaders,
    };
};

exports.handler = async event => {
    try {
        const origin = event.headers?.origin || event.headers?.Origin || '*';
        const ifNoneMatch =
            event.headers?.['if-none-match'] ||
            event.headers?.['If-None-Match'];

        // Get menu items - optimized to only fetch core menu item data
        const command = new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: 'begins_with(pk, :itemPrefix) AND pk = sk',
            ExpressionAttributeValues: {
                ':itemPrefix': 'ITEM#',
            },
        });

        const result = await docClient.send(command);
        let menuItems = result.Items || [];

        // Clean up menu items to exclude modifier-related fields and ensure consistent structure
        menuItems = menuItems.map(item => ({
            pk: item.pk,
            sk: item.sk,
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            categoryId: item.categoryId,
            vegetarian: item.vegetarian,
            active: item.active,
            ...(item.portionSize && { portionSize: item.portionSize }),
            ...(item.unitCount != null && { unitCount: item.unitCount }),
            ...(item.img && { img: item.img }),
            ...(item.alt && { alt: item.alt }),
            ...(item.categoryName && { categoryName: item.categoryName }),
            ...(item.createdAt && { createdAt: item.createdAt }),
        }));

        // Get current menu version
        const menuVersion = await getMenuVersion();

        // Generate ETag based on menu version and data
        const etagData = { version: menuVersion, items: menuItems };
        const etag = generateETag(etagData);

        // Check if client has the same version
        if (ifNoneMatch && ifNoneMatch === etag) {
            return {
                statusCode: 304,
                headers: getCorsHeaders(origin, {
                    ETag: etag,
                    'X-Menu-Version': menuVersion.toString(),
                }),
            };
        }

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin, {
                ETag: etag,
                'X-Menu-Version': menuVersion.toString(),
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify(menuItems),
        };
    } catch (error) {
        console.error('Error:', error);
        const origin = event.headers?.origin || event.headers?.Origin || '*';
        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
