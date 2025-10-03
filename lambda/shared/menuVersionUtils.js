const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Increment the menu version to invalidate caches when menu data changes
 * @returns {Promise<Object|null>} The updated version info or null if failed
 */
async function incrementMenuVersion() {
    try {
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
        console.log(
            'Menu version incremented to:',
            response.Attributes.version
        );
        return response.Attributes;
    } catch (error) {
        console.error('Error incrementing menu version:', error);
        // Don't fail the entire operation if version increment fails
        return null;
    }
}

module.exports = {
    incrementMenuVersion,
};
