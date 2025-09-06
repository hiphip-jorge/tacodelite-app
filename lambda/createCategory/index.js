const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);

        // Validate required fields
        const requiredFields = ['name', 'description', 'active'];
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

        // Generate a unique category ID by finding the highest existing ID and adding 1
        const scanParams = {
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: 'begins_with(pk, :categoryPrefix)',
            ExpressionAttributeValues: {
                ':categoryPrefix': 'CATEGORY#'
            }
        };

        const scanCommand = new ScanCommand(scanParams);
        const scanResult = await docClient.send(scanCommand);

        let maxId = 0;
        let maxSortOrder = 0;

        if (scanResult.Items && scanResult.Items.length > 0) {
            scanResult.Items.forEach(item => {
                // Extract ID from pk (e.g., "CATEGORY#5" -> 5)
                const idMatch = item.pk.match(/CATEGORY#(\d+)/);
                if (idMatch) {
                    const id = parseInt(idMatch[1]);
                    if (id > maxId) {
                        maxId = id;
                    }
                }

                // Track highest sortOrder
                if (item.sortOrder && item.sortOrder > maxSortOrder) {
                    maxSortOrder = item.sortOrder;
                }
            });
        }

        const newCategoryId = maxId + 1;
        const newSortOrder = maxSortOrder + 1;

        // Create the new category
        const categoryData = {
            pk: `CATEGORY#${newCategoryId}`,
            name: body.name,
            description: body.description,
            sortOrder: body.sortOrder || newSortOrder, // Allow custom sortOrder or auto-generate
            active: body.active,
            createdAt: new Date().toISOString()
        };

        const putParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: categoryData
        };

        const putCommand = new PutCommand(putParams);
        await docClient.send(putCommand);

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                message: 'Category created successfully',
                category: categoryData
            })
        };
    } catch (error) {
        console.error('Error creating category:', error);
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
