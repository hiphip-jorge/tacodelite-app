const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async () => {
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

        // If no version exists, create one
        if (!response.Item) {
            const version = 1;
            const timestamp = new Date().toISOString();

            // We'll create the version record in a separate call
            // For now, return version 1
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin':
                        process.env.ALLOWED_ORIGINS || '*',
                    'Access-Control-Allow-Headers':
                        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                },
                body: JSON.stringify({
                    version: version,
                    timestamp: timestamp,
                    message: 'Menu version retrieved successfully',
                }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin':
                    process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers':
                    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
            },
            body: JSON.stringify({
                version: response.Item.version,
                timestamp: response.Item.timestamp,
                message: 'Menu version retrieved successfully',
            }),
        };
    } catch (error) {
        console.error('Error getting menu version:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin':
                    process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers':
                    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
            },
            body: JSON.stringify({
                error: 'Failed to get menu version',
                message: error.message,
            }),
        };
    }
};
