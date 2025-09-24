const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { incrementMenuVersion } = require('../shared/menuVersionUtils');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    console.log('🗑️ Delete category request:', JSON.stringify(event, null, 2));

    try {
        // Parse the category ID from the path parameters
        const categoryId = event.pathParameters?.id;

        if (!categoryId) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
                },
                body: JSON.stringify({
                    error: 'Category ID is required'
                })
            };
        }

        // First, check if there are any menu items in this category
        const checkItemsParams = {
            TableName: process.env.DYNAMODB_TABLE,
            KeyConditionExpression: 'pk = :pk',
            ExpressionAttributeValues: {
                ':pk': `ITEM#${categoryId}`
            }
        };

        console.log('🔍 Checking for menu items in category:', categoryId);
        const itemsResult = await docClient.send(new QueryCommand(checkItemsParams));

        if (itemsResult.Items && itemsResult.Items.length > 0) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
                },
                body: JSON.stringify({
                    error: 'Cannot delete category that contains menu items',
                    itemCount: itemsResult.Items.length
                })
            };
        }

        // Delete the category
        const deleteParams = {
            TableName: process.env.CATEGORIES_TABLE,
            Key: {
                pk: `CATEGORY#${categoryId}`
            }
        };

        console.log('🗑️ Deleting category:', categoryId);
        await docClient.send(new DeleteCommand(deleteParams));

        // Increment menu version after successful deletion
        const versionInfo = await incrementMenuVersion();

        console.log('✅ Category deleted successfully:', categoryId);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            body: JSON.stringify({
                message: 'Category deleted successfully',
                categoryId: categoryId,
                version: versionInfo?.version || 'unknown'
            })
        };

    } catch (error) {
        console.error('❌ Error deleting category:', error);

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            body: JSON.stringify({
                error: 'Failed to delete category',
                details: error.message
            })
        };
    }
};
