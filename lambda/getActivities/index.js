const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const getCorsHeaders = (origin) => {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };
};

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));

        const origin = event.headers?.origin || event.headers?.Origin || '*';

        // Handle CORS preflight request
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: getCorsHeaders(origin),
                body: ''
            };
        }

        // Get query parameters
        const queryParams = event.queryStringParameters || {};
        const limit = parseInt(queryParams.limit) || 10; // Default to 10 recent activities

        // Determine table name based on environment
        const tableName = process.env.AWS_LAMBDA_FUNCTION_NAME?.includes('staging')
            ? 'tacodelite-app-activities-staging'
            : 'tacodelite-app-activities-production';

        // Scan for activities
        const params = {
            TableName: tableName,
            FilterExpression: 'begins_with(pk, :activityPrefix)',
            ExpressionAttributeValues: {
                ':activityPrefix': 'ACTIVITY#'
            }
        };

        const command = new ScanCommand(params);
        const result = await docClient.send(command);

        // Transform the data to remove DynamoDB-specific fields
        const activities = (result.Items || []).map(item => ({
            id: item.id,
            type: item.type,
            action: item.action,
            item: item.itemName,
            itemId: item.itemId,
            userId: item.userId,
            userName: item.userName,
            timestamp: item.timestamp,
            createdAt: item.createdAt
        }));

        // Sort by timestamp (newest first) and limit results
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recentActivities = activities.slice(0, limit);

        // Format time for display
        const formatTimeAgo = (timestamp) => {
            const now = new Date();
            const activityTime = new Date(timestamp);
            const diffInSeconds = Math.floor((now - activityTime) / 1000);

            if (diffInSeconds < 60) {
                return `${diffInSeconds}s ago`;
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes}m ago`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `${hours}h ago`;
            } else {
                const days = Math.floor(diffInSeconds / 86400);
                return `${days}d ago`;
            }
        };

        // Add formatted time to each activity
        const formattedActivities = recentActivities.map(activity => ({
            ...activity,
            time: formatTimeAgo(activity.timestamp)
        }));

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin),
            body: JSON.stringify(formattedActivities)
        };

    } catch (error) {
        console.error('Get activities error:', error);
        const origin = event.headers?.origin || event.headers?.Origin || '*';
        return {
            statusCode: 500,
            headers: getCorsHeaders(origin),
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};
