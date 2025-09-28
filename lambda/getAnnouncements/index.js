const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const getCorsHeaders = (origin, additionalHeaders = {}) => {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        ...additionalHeaders
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
        const activeOnly = queryParams.activeOnly === 'true';

        // Build scan parameters
        let filterExpression = 'begins_with(pk, :announcementPrefix)';
        let expressionAttributeValues = {
            ':announcementPrefix': 'ANNOUNCEMENT'
        };

        // Add active filter if requested
        if (activeOnly) {
            filterExpression += ' AND active = :active';
            expressionAttributeValues[':active'] = true;
        }

        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: filterExpression,
            ExpressionAttributeValues: expressionAttributeValues
        };

        const command = new ScanCommand(params);
        const result = await docClient.send(command);

        // Transform the data to remove DynamoDB-specific fields
        const announcements = (result.Items || []).map(item => ({
            id: item.id,
            title: item.title,
            message: item.message,
            type: item.type,
            active: item.active,
            expiresAt: item.expiresAt,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            createdBy: item.createdBy
        }));

        // Sort by creation date (newest first)
        announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Filter out expired announcements if activeOnly is true
        const now = new Date();
        const filteredAnnouncements = activeOnly
            ? announcements.filter(announcement => {
                if (!announcement.expiresAt) return true;

                // Handle date-only expiration dates (YYYY-MM-DD format)
                // Convert to end of day in local timezone to avoid timezone issues
                const expirationDate = new Date(announcement.expiresAt);
                if (announcement.expiresAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    // Date-only format: set to end of day in local timezone
                    expirationDate.setHours(23, 59, 59, 999);
                }

                return expirationDate > now;
            })
            : announcements;

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin, {
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(filteredAnnouncements)
        };

    } catch (error) {
        console.error('Get announcements error:', error);
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
