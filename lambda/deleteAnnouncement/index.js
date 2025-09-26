const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const getCorsHeaders = (origin, additionalHeaders = {}) => {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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

        // Get announcement ID from path parameters
        const announcementId = event.pathParameters?.id;
        if (!announcementId) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'Announcement ID is required'
                })
            };
        }

        // Check if announcement exists
        const getParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: 'ANNOUNCEMENT',
                sk: `ANNOUNCEMENT#${announcementId}`
            }
        };

        const getCommand = new GetCommand(getParams);
        const existingAnnouncement = await docClient.send(getCommand);

        if (!existingAnnouncement.Item) {
            return {
                statusCode: 404,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'Announcement not found'
                })
            };
        }

        // Delete announcement
        const deleteParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: 'ANNOUNCEMENT',
                sk: `ANNOUNCEMENT#${announcementId}`
            }
        };

        const deleteCommand = new DeleteCommand(deleteParams);
        await docClient.send(deleteCommand);

        console.log('Announcement deleted successfully:', announcementId);

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin, {
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                success: true,
                message: 'Announcement deleted successfully'
            })
        };

    } catch (error) {
        console.error('Delete announcement error:', error);
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
