const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async () => {
    try {
        // Increment the menu version
        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: 'MENU_VERSION',
                sk: 'MENU_VERSION',
            },
            UpdateExpression:
                'SET #version = if_not_exists(#version, :initialVersion) + :increment, #timestamp = :timestamp',
            ExpressionAttributeNames: {
                '#version': 'version',
                '#timestamp': 'timestamp',
            },
            ExpressionAttributeValues: {
                ':initialVersion': 0,
                ':increment': 1,
                ':timestamp': new Date().toISOString(),
            },
            ReturnValues: 'ALL_NEW',
        };

        const command = new UpdateCommand(params);
        const response = await docClient.send(command);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin':
                    process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers':
                    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
            body: JSON.stringify({
                version: response.Attributes.version,
                timestamp: response.Attributes.timestamp,
                message: 'Menu version incremented successfully',
            }),
        };
    } catch (error) {
        console.error('Error incrementing menu version:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin':
                    process.env.ALLOWED_ORIGINS || '*',
                'Access-Control-Allow-Headers':
                    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
            body: JSON.stringify({
                error: 'Failed to increment menu version',
                message: error.message,
            }),
        };
    }
};
