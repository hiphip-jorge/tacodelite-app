const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async () => {
    try {
        const command = new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: 'begins_with(pk, :categoryPrefix)',
            ExpressionAttributeValues: {
                ':categoryPrefix': 'CATEGORY#'
            }
        });

        const result = await docClient.send(command);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Cache-Control': 'public, max-age=3600',
                'ETag': `"${Date.now()}"`,
                'Vary': 'Origin'
            },
            body: JSON.stringify(result.Items)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
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
