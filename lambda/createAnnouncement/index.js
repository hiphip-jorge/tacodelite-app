const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const getCorsHeaders = (origin, additionalHeaders = {}) => {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

        // Parse request body
        const body = JSON.parse(event.body);
        const { title, message, type = 'general', active = true, expiresAt } = body;

        // Validate required fields
        if (!title || !message) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'Title and message are required'
                })
            };
        }

        // Generate announcement ID
        const announcementId = `ANN${Date.now()}`;
        const timestamp = new Date().toISOString();

        // Create announcement object
        const announcement = {
            pk: 'ANNOUNCEMENT',
            sk: `ANNOUNCEMENT#${announcementId}`,
            id: announcementId,
            title,
            message,
            type, // info, warning, success, error
            active,
            expiresAt: expiresAt || null,
            createdAt: timestamp,
            updatedAt: timestamp,
            createdBy: 'admin' // TODO: Get from auth context
        };

        // Save to DynamoDB
        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: announcement
        };

        const command = new PutCommand(params);
        await docClient.send(command);

        console.log('Announcement created successfully:', announcementId);

        return {
            statusCode: 201,
            headers: getCorsHeaders(origin, {
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                success: true,
                announcement: {
                    id: announcement.id,
                    title: announcement.title,
                    message: announcement.message,
                    type: announcement.type,
                    active: announcement.active,
                    expiresAt: announcement.expiresAt,
                    createdAt: announcement.createdAt
                }
            })
        };

    } catch (error) {
        console.error('Create announcement error:', error);
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
