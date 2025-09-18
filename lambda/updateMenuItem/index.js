const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

// Helper function to increment menu version
async function incrementMenuVersion() {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: 'MENU_VERSION',
                sk: 'MENU_VERSION'
            },
            UpdateExpression: 'SET #version = if_not_exists(#version, :initialVersion) + :increment, #timestamp = :timestamp',
            ExpressionAttributeNames: {
                '#version': 'version',
                '#timestamp': 'timestamp'
            },
            ExpressionAttributeValues: {
                ':initialVersion': 0,
                ':increment': 1,
                ':timestamp': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        const command = new UpdateCommand(params);
        const response = await docClient.send(command);
        console.log('Menu version incremented to:', response.Attributes.version);
        return response.Attributes;
    } catch (error) {
        console.error('Error incrementing menu version:', error);
        // Don't fail the entire operation if version increment fails
        return null;
    }
}

exports.handler = async (event) => {
    try {
        // Get the item ID from path parameters
        const itemId = event.pathParameters?.id;
        const body = JSON.parse(event.body);

        if (!itemId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'PUT, OPTIONS'
                },
                body: JSON.stringify({ error: 'Item ID is required' })
            };
        }

        // Validate required fields
        const requiredFields = ['name', 'price', 'active', 'vegetarian', 'description', 'categoryId'];
        const missingFields = requiredFields.filter(field => body[field] === undefined);

        if (missingFields.length > 0) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'PUT, OPTIONS'
                },
                body: JSON.stringify({
                    error: 'Missing required fields',
                    missingFields
                })
            };
        }

        // Use the categoryId from the request body to construct the key
        const categoryId = body.categoryId;
        const itemIdNumber = itemId;

        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `ITEM#${categoryId}`,
                sk: `ITEM#${itemIdNumber}`
            },
            UpdateExpression: 'SET #name = :name, #price = :price, #active = :active, #vegetarian = :vegetarian, #description = :description, #categoryId = :categoryId, #id = :id',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#price': 'price',
                '#active': 'active',
                '#vegetarian': 'vegetarian',
                '#description': 'description',
                '#categoryId': 'categoryId',
                '#id': 'id'
            },
            ExpressionAttributeValues: {
                ':name': body.name,
                ':price': body.price,
                ':active': body.active,
                ':vegetarian': body.vegetarian,
                ':description': body.description,
                ':categoryId': body.categoryId,
                ':id': parseInt(itemIdNumber)
            },
            ReturnValues: 'ALL_NEW'
        };

        const command = new UpdateCommand(params);
        const response = await docClient.send(command);

        // Increment menu version after successful update
        const versionInfo = await incrementMenuVersion();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'PUT, OPTIONS'
            },
            body: JSON.stringify({
                message: 'Menu item updated successfully',
                item: response.Attributes,
                version: versionInfo?.version || 'unknown'
            })
        };
    } catch (error) {
        console.error('Error updating menu item:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'PUT, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Failed to update menu item',
                message: error.message
            })
        };
    }
};
