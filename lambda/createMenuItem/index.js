const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { incrementMenuVersion } = require('./shared/menuVersionUtils');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);

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
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                body: JSON.stringify({
                    error: 'Missing required fields',
                    missingFields
                })
            };
        }

        // Generate a unique item ID by finding the highest existing ID and adding 1
        const scanParams = {
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: 'begins_with(pk, :itemPrefix)',
            ExpressionAttributeValues: {
                ':itemPrefix': 'ITEM#'
            }
        };

        const scanCommand = new ScanCommand(scanParams);
        const scanResult = await docClient.send(scanCommand);

        let maxId = 0;
        if (scanResult.Items && scanResult.Items.length > 0) {
            scanResult.Items.forEach(item => {
                if (item.id && item.id > maxId) {
                    maxId = item.id;
                }
            });
        }

        const newItemId = maxId + 1;
        const categoryId = body.categoryId;

        // Get category name for the item
        const categoryParams = {
            TableName: process.env.CATEGORIES_TABLE || process.env.DYNAMODB_TABLE.replace('menu-items', 'categories'),
            Key: {
                pk: `CATEGORY#${categoryId}`
            }
        };

        let categoryName = `Category ${categoryId}`;
        try {
            const { GetCommand } = require('@aws-sdk/lib-dynamodb');
            const getCategoryCommand = new GetCommand(categoryParams);
            const categoryResult = await docClient.send(getCategoryCommand);
            if (categoryResult.Item) {
                categoryName = categoryResult.Item.name;
            }
        } catch (error) {
            console.warn('Could not fetch category name:', error);
        }

        // Create the new menu item
        const itemData = {
            pk: `ITEM#${categoryId}`,
            sk: `ITEM#${newItemId}`,
            id: newItemId,
            name: body.name,
            price: parseFloat(body.price),
            active: body.active,
            vegetarian: body.vegetarian,
            description: body.description,
            categoryId: parseInt(categoryId),
            categoryName: categoryName,
            alt: body.alt || null,
            img: body.img || null,
            modifierGroups: body.modifierGroups || [],
            createdAt: new Date().toISOString()
        };

        const putParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: itemData
        };

        const putCommand = new PutCommand(putParams);
        await docClient.send(putCommand);

        // Increment menu version after successful creation
        const versionInfo = await incrementMenuVersion();

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                message: 'Menu item created successfully',
                item: itemData,
                version: versionInfo?.version || 'unknown'
            })
        };
    } catch (error) {
        console.error('Error creating menu item:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
