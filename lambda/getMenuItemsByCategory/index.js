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
                    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
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
            TableName: process.env.DYNAMODB_TABLE
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
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Cache-Control': 'public, max-age=3600',
                'ETag': `"${Date.now()}"`,
                'Vary': 'Origin'
            },
            body: JSON.stringify(filteredItems)
        };
    } catch (error) {
        console.error('Error fetching menu items by category:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Cache-Control': 'public, max-age=3600',
                'ETag': `"${Date.now()}"`,
                'Vary': 'Origin'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
