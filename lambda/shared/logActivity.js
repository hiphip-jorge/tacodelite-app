const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');

const docClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Log an activity to DynamoDB
 * @param {string} type - Activity type (menu_item, category, modifier_group, etc.)
 * @param {string} action - Action performed (created, updated, deleted)
 * @param {string} itemName - Name of the item
 * @param {string} itemId - ID of the item
 * @param {string} userId - User ID who performed the action (optional)
 * @param {string} userName - User name who performed the action (optional)
 * @param {object} event - Lambda event object to extract user info from headers
 */
async function logActivity(type, action, itemName, itemId = null, userId = null, userName = null, event = null) {
    try {
        const now = new Date().toISOString();
        const activityId = Date.now().toString();

        // Extract user info from event headers if not provided
        let finalUserId = userId;
        let finalUserName = userName;

        if (event && event.headers) {
            // Check for user info in headers (sent from frontend)
            if (event.headers['x-user-id']) {
                finalUserId = event.headers['x-user-id'];
            }
            if (event.headers['x-user-name']) {
                finalUserName = event.headers['x-user-name'];
            }
        }

        const activity = {
            pk: `ACTIVITY#${activityId}`,
            sk: `ACTIVITY#${activityId}`,
            id: activityId,
            type: type,
            action: action,
            itemName: itemName,
            itemId: itemId,
            userId: finalUserId,
            userName: finalUserName,
            timestamp: now,
            createdAt: now,
            updatedAt: now
        };

        // Determine table name based on environment
        const tableName = process.env.AWS_LAMBDA_FUNCTION_NAME?.includes('staging')
            ? 'tacodelite-app-activities-staging'
            : 'tacodelite-app-activities-production';

        const putParams = {
            TableName: tableName,
            Item: activity
        };

        await docClient.send(new PutCommand(putParams));
        console.log(`📝 Activity logged: ${action} ${type} "${itemName}"`);
    } catch (error) {
        // Don't throw error - activity logging shouldn't break the main operation
        console.error('Failed to log activity:', error);
    }
}

module.exports = { logActivity };
