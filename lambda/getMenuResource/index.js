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

// Clean menu items to exclude modifier-related fields and ensure consistent structure
function cleanMenuItems(items) {
    return items.map(item => {
        // Support categoryId from various field names (categoryId, category_id)
        const categoryId = item.categoryId ?? item.category_id ?? undefined;

        return {
            pk: item.pk,
            sk: item.sk,
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            categoryId,
            vegetarian: item.vegetarian,
            active: item.active,
            // Include any other core fields that exist
            ...(item.img && { img: item.img }),
            ...(item.alt && { alt: item.alt }),
            ...(item.categoryName && { categoryName: item.categoryName }),
            ...(item.createdAt && { createdAt: item.createdAt }),
        };
    });
}

// Get menu items (core items only, no modifiers)
async function getMenuItems() {
    const command = new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE,
        FilterExpression: 'begins_with(pk, :itemPrefix) AND pk = sk',
        ExpressionAttributeValues: {
            ':itemPrefix': 'ITEM#',
        },
    });

    const result = await docClient.send(command);
    return cleanMenuItems(result.Items || []);
}

// Get modifier groups
async function getModifierGroups() {
    const command = new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE,
        FilterExpression: 'begins_with(pk, :groupPrefix) AND pk = sk',
        ExpressionAttributeValues: {
            ':groupPrefix': 'MODIFIER_GROUP#',
        },
    });

    const result = await docClient.send(command);
    return result.Items || [];
}

// Get modifiers
async function getModifiers() {
    const command = new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE,
        FilterExpression: 'begins_with(pk, :modifierPrefix)',
        ExpressionAttributeValues: {
            ':modifierPrefix': 'MODIFIER#',
        },
    });

    const result = await docClient.send(command);
    return result.Items || [];
}

// Get categories
async function getCategories() {
    const command = new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE,
        FilterExpression: 'begins_with(pk, :categoryPrefix)',
        ExpressionAttributeValues: {
            ':categoryPrefix': 'CATEGORY#',
        },
    });

    const result = await docClient.send(command);
    return result.Items || [];
}

exports.handler = async event => {
    try {
        const origin = event.headers?.origin || event.headers?.Origin || '*';
        const ifNoneMatch =
            event.headers?.['if-none-match'] ||
            event.headers?.['If-None-Match'];

        // Parse the path to determine resource type
        const path = event.path || event.requestContext?.path || '';
        const pathSegments = path.split('/').filter(Boolean);

        // Expected path structure: /prod/menu/{resource}/{subresource}
        // pathSegments: ['prod', 'menu', 'items', 'items'] or ['prod', 'menu', 'menu-items', 'items', 'by-category', '123']

        const resource = pathSegments[2]; // 'items', 'categories', 'menu-items', etc.
        const subResource = pathSegments[3]; // 'items', 'modifiers', 'by-category', etc.
        const pathSegment4 = pathSegments[4]; // 'by-category', 'search', or category id
        const pathSegment5 = pathSegments[5]; // category id when pathSegment4 is 'by-category'
        const queryParams = event.queryStringParameters || {};

        let responseData = {};
        let resourceType = 'items'; // default

        // Normalize: menu-items/items/* uses same logic as items/*
        const effectiveResource =
            resource === 'menu-items' && subResource === 'items'
                ? 'items'
                : resource;
        const effectiveSubResource =
            resource === 'menu-items' && subResource === 'items'
                ? pathSegment4
                : subResource;
        const effectiveCategoryId =
            resource === 'menu-items' && pathSegment4 === 'by-category'
                ? pathSegment5
                : pathSegment4;

        // Determine what data to fetch based on path
        if (effectiveResource === 'items') {
            if (effectiveSubResource === 'items') {
                // /menu/items/items or /menu/menu-items - just menu items
                responseData.items = await getMenuItems();
                responseData.count = responseData.items.length;
                resourceType = 'items-only';
            } else if (effectiveSubResource === 'modifiers') {
                // /menu/items/modifiers - just modifiers
                responseData.modifierGroups = await getModifierGroups();
                responseData.modifiers = await getModifiers();
                responseData.count = responseData.modifiers.length;
                resourceType = 'modifiers-only';
            } else if (
                effectiveSubResource === 'by-category' &&
                effectiveCategoryId
            ) {
                // /menu/items/by-category/{id} or /menu/menu-items/items/by-category/{id}
                const categoryId = effectiveCategoryId;
                const allItems = await getMenuItems();
                responseData.items = allItems.filter(
                    item =>
                        item.active && item.categoryId === parseInt(categoryId)
                );
                responseData.categoryId = parseInt(categoryId);
                responseData.count = responseData.items.length;
                resourceType = 'items-by-category';
            } else if (effectiveSubResource === 'search') {
                // /menu/items/search?query=...
                const searchTerm = queryParams.query?.toLowerCase() || '';
                const allItems = await getMenuItems();
                responseData.items = allItems.filter(
                    item =>
                        item.active &&
                        (item.name.toLowerCase().includes(searchTerm) ||
                            (item.description &&
                                item.description
                                    .toLowerCase()
                                    .includes(searchTerm)) ||
                            (searchTerm.includes('vegetarian') &&
                                item.vegetarian === true) ||
                            (searchTerm.includes('vegan') &&
                                item.vegetarian === true) ||
                            (searchTerm === 'vegetarian' &&
                                item.vegetarian === true))
                );
                responseData.query = queryParams.query;
                responseData.count = responseData.items.length;
                resourceType = 'search';
            } else {
                // /menu/items - all items (default, items only for now)
                responseData.items = await getMenuItems();
                responseData.count = responseData.items.length;
                resourceType = 'items-only';
            }
        } else if (resource === 'categories') {
            responseData.categories = await getCategories();
            responseData.count = responseData.categories.length;
            resourceType = 'categories';
        } else {
            // Default to menu items
            responseData.items = await getMenuItems();
            responseData.count = responseData.items.length;
            resourceType = 'items-only';
        }

        // Get current menu version
        const menuVersion = await getMenuVersion();

        // Generate ETag based on menu version and data
        const etagData = {
            version: menuVersion,
            type: resourceType,
            data: responseData,
        };
        const etag = generateETag(etagData);

        // Check if client has the same version
        if (ifNoneMatch && ifNoneMatch === etag) {
            return {
                statusCode: 304,
                headers: getCorsHeaders(origin, {
                    ETag: etag,
                    'X-Menu-Version': menuVersion.toString(),
                    'X-Resource-Type': resourceType,
                }),
            };
        }

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin, {
                ETag: etag,
                'X-Menu-Version': menuVersion.toString(),
                'X-Resource-Type': resourceType,
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify(responseData),
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
