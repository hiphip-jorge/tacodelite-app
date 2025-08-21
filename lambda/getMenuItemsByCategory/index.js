const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const { categoryId } = event.queryStringParameters || {};

        if (!categoryId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://tacodelite-app-staging.s3-website-us-east-1.amazonaws.com',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Category ID parameter is required'
                })
            };
        }

        const params = {
            TableName: process.env.MENU_ITEMS_TABLE || 'menu_items'
        };

        const command = new ScanCommand(params);
        const result = await docClient.send(command);

        // Filter items by category
        let filteredItems;
        if (categoryId === 'all') {
            filteredItems = result.Items.filter(item => item.active);
        } else {
            filteredItems = result.Items.filter(item =>
                item.active && item.categoryId === parseInt(categoryId)
            );
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://tacodelite-app-staging.s3-website-us-east-1.amazonaws.com',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Cache-Control': 'max-age=2592000, public', // 30 days - menu changes rarely
                'ETag': 'W/"menu-items-category-v1"',
                'Vary': 'Accept-Encoding'
            },
            body: JSON.stringify({
                success: true,
                data: filteredItems,
                count: filteredItems.length,
                categoryId: categoryId
            })
        };
    } catch (error) {
        console.error('Error fetching menu items by category:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://tacodelite-app-staging.s3-website-us-east-1.amazonaws.com',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch menu items by category',
                message: error.message
            })
        };
    }
};
