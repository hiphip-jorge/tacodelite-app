const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, ScanCommand, DeleteCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { incrementMenuVersion } = require('./shared/menuVersionUtils');
const { logActivity } = require('./shared/logActivity');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

// CORS headers helper function
const getCorsHeaders = (origin, additionalHeaders = {}) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '*';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        ...additionalHeaders
    };
};

exports.handler = async (event) => {
    try {
        // Get the item ID from path parameters
        const itemId = event.pathParameters?.id;
        const body = JSON.parse(event.body);

        if (!itemId) {
            const origin = event.headers?.origin || event.headers?.Origin || '*';
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin, {
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({ error: 'Item ID is required' })
            };
        }

        // Validate required fields
        const requiredFields = ['name', 'price', 'active', 'vegetarian', 'description', 'categoryId'];
        const missingFields = requiredFields.filter(field => body[field] === undefined);

        if (missingFields.length > 0) {
            const origin = event.headers?.origin || event.headers?.Origin || '*';
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin, {
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    error: 'Missing required fields',
                    missingFields
                })
            };
        }

        const itemIdNumber = itemId;

        // First, find the existing item to get its current category
        const scanParams = {
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: '#id = :id',
            ExpressionAttributeNames: {
                '#id': 'id'
            },
            ExpressionAttributeValues: {
                ':id': parseInt(itemIdNumber)
            }
        };

        const scanCommand = new ScanCommand(scanParams);
        const scanResult = await docClient.send(scanCommand);

        if (!scanResult.Items || scanResult.Items.length === 0) {
            const origin = event.headers?.origin || event.headers?.Origin || '*';
            return {
                statusCode: 404,
                headers: getCorsHeaders(origin, {
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({ error: 'Menu item not found' })
            };
        }

        const existingItem = scanResult.Items[0];
        const originalCategoryId = existingItem.categoryId;
        const newCategoryId = body.categoryId;

        // If category changed, we need to delete the old item and create a new one
        if (originalCategoryId !== newCategoryId) {
            // Delete the old item
            const deleteParams = {
                TableName: process.env.DYNAMODB_TABLE,
                Key: {
                    pk: existingItem.pk,
                    sk: existingItem.sk
                }
            };
            await docClient.send(new DeleteCommand(deleteParams));

            // Create new item in the new category
            const putParams = {
                TableName: process.env.DYNAMODB_TABLE,
                Item: {
                    pk: `ITEM#${newCategoryId}`,
                    sk: `ITEM#${itemIdNumber}`,
                    id: parseInt(itemIdNumber),
                    name: body.name,
                    price: body.price,
                    active: body.active,
                    vegetarian: body.vegetarian,
                    description: body.description,
                    categoryId: newCategoryId,
                    modifierGroups: body.modifierGroups || []
                }
            };
            const putCommand = new PutCommand(putParams);
            await docClient.send(putCommand);
        } else {
            // Category didn't change, just update the existing item
            const updateParams = {
                TableName: process.env.DYNAMODB_TABLE,
                Key: {
                    pk: existingItem.pk,
                    sk: existingItem.sk
                },
                UpdateExpression: 'SET #name = :name, #price = :price, #active = :active, #vegetarian = :vegetarian, #description = :description, #categoryId = :categoryId, #id = :id, #modifierGroups = :modifierGroups',
                ExpressionAttributeNames: {
                    '#name': 'name',
                    '#price': 'price',
                    '#active': 'active',
                    '#vegetarian': 'vegetarian',
                    '#description': 'description',
                    '#categoryId': 'categoryId',
                    '#id': 'id',
                    '#modifierGroups': 'modifierGroups'
                },
                ExpressionAttributeValues: {
                    ':name': body.name,
                    ':price': body.price,
                    ':active': body.active,
                    ':vegetarian': body.vegetarian,
                    ':description': body.description,
                    ':categoryId': body.categoryId,
                    ':id': parseInt(itemIdNumber),
                    ':modifierGroups': body.modifierGroups || []
                },
                ReturnValues: 'ALL_NEW'
            };

            const updateCommand = new UpdateCommand(updateParams);
            await docClient.send(updateCommand);
        }

        // Increment menu version after successful update
        const versionInfo = await incrementMenuVersion();

        // Log activity
        await logActivity(
            'menu_item',
            'updated',
            body.name,
            itemId,
            null, // userId
            null, // userName
            event // Pass event to extract user info from headers
        );

        const origin = event.headers?.origin || event.headers?.Origin || '*';
        return {
            statusCode: 200,
            headers: getCorsHeaders(origin, {
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                message: 'Menu item updated successfully',
                version: versionInfo?.version || 'unknown'
            })
        };
    } catch (error) {
        console.error('Error updating menu item:', error);
        const origin = event.headers?.origin || event.headers?.Origin || '*';
        return {
            statusCode: 500,
            headers: getCorsHeaders(origin, {
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                error: 'Failed to update menu item',
                message: error.message
            })
        };
    }
};
