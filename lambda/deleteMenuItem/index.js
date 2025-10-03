const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    ScanCommand,
    DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { incrementMenuVersion } = require('./shared/menuVersionUtils');
const { logActivity } = require('./shared/logActivity');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async event => {
    try {
        const itemId = event.pathParameters?.id;

        if (!itemId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin':
                        process.env.ALLOWED_ORIGINS || '*',
                    'Access-Control-Allow-Headers':
                        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
                },
                body: JSON.stringify({
                    error: 'Item ID is required',
                    message: 'Please provide a valid item ID',
                }),
            };
        }

        // First, we need to get the item to find its categoryId for the composite key
        // We'll need to scan the table to find the item by its ID
        const scanParams = {
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: 'sk = :itemId',
            ExpressionAttributeValues: {
                ':itemId': `ITEM#${itemId}`,
            },
        };

        console.log('🔍 Scanning for item with ID:', itemId);
        console.log('📋 Scan params:', JSON.stringify(scanParams, null, 2));

        const scanCommand = new ScanCommand(scanParams);
        const scanResult = await docClient.send(scanCommand);

        console.log('📊 Scan result:', JSON.stringify(scanResult, null, 2));

        if (!scanResult.Items || scanResult.Items.length === 0) {
            console.log('❌ No items found in scan');
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin':
                        process.env.ALLOWED_ORIGINS || '*',
                    'Access-Control-Allow-Headers':
                        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
                },
                body: JSON.stringify({
                    error: 'Menu item not found',
                    message: `Item with ID ${itemId} does not exist`,
                }),
            };
        }

        const item = scanResult.Items[0];
        const categoryId = item.categoryId || item.pk?.replace('ITEM#', '');

        console.log('🏷️ Found item:', JSON.stringify(item, null, 2));
        console.log('🏷️ Extracted categoryId:', categoryId);

        if (!categoryId) {
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin':
                        process.env.ALLOWED_ORIGINS || '*',
                    'Access-Control-Allow-Headers':
                        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
                },
                body: JSON.stringify({
                    error: 'Invalid item structure',
                    message: 'Could not determine category ID for the item',
                }),
            };
        }

        // Delete the item using the composite key
        const deleteParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `ITEM#${categoryId}`,
                sk: `ITEM#${itemId}`,
            },
        };

        console.log('🗑️ Delete params:', JSON.stringify(deleteParams, null, 2));

        const deleteCommand = new DeleteCommand(deleteParams);
        await docClient.send(deleteCommand);

        // Increment menu version after successful deletion
        const versionInfo = await incrementMenuVersion();

        // Log activity
        await logActivity(
            process.env.DYNAMODB_TABLE,
            'menu_item',
            'deleted',
            item.name,
            itemId,
            null, // userId
            null, // userName
            event // Pass event to extract user info from headers
        );

        console.log('✅ Item deleted successfully');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin':
                    process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers':
                    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
            },
            body: JSON.stringify({
                message: 'Menu item deleted successfully',
                deletedItemId: itemId,
                version: versionInfo?.version || 'unknown',
            }),
        };
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin':
                    process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers':
                    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
            },
            body: JSON.stringify({
                error: 'Failed to delete menu item',
                message: error.message,
            }),
        };
    }
};
