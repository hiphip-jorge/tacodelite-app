const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { incrementMenuVersion } = require('./shared/menuVersionUtils');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        // Get the category ID from path parameters
        const categoryId = event.pathParameters?.id;
        const body = JSON.parse(event.body);

        if (!categoryId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'PUT, OPTIONS'
                },
                body: JSON.stringify({ error: 'Category ID is required' })
            };
        }

        // Validate required fields
        const requiredFields = ['name', 'active'];
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

        // First, get the existing category
        const getParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `CATEGORY#${categoryId}`
            }
        };

        const getCommand = new GetCommand(getParams);
        const existingCategory = await docClient.send(getCommand);

        if (!existingCategory.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'PUT, OPTIONS'
                },
                body: JSON.stringify({ error: 'Category not found' })
            };
        }

        // Update the category with new data
        const updatedCategory = {
            ...existingCategory.Item,
            name: body.name,
            active: body.active,
            id: parseInt(categoryId)
        };

        const putParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: updatedCategory
        };

        const putCommand = new PutCommand(putParams);
        await docClient.send(putCommand);

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
                message: 'Category updated successfully',
                category: updatedCategory,
                version: versionInfo?.version || 'unknown'
            })
        };
    } catch (error) {
        console.error('Error updating category:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'PUT, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Failed to update category',
                message: error.message
            })
        };
    }
};
