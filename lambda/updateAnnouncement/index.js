const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const getCorsHeaders = (origin, additionalHeaders = {}) => {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
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

        // Parse request body
        const body = JSON.parse(event.body);
        const { title, message, type, active, expiresAt } = body;

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

        // Build update expression dynamically
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        if (title !== undefined) {
            updateExpressions.push('#title = :title');
            expressionAttributeNames['#title'] = 'title';
            expressionAttributeValues[':title'] = title;
        }

        if (message !== undefined) {
            updateExpressions.push('#message = :message');
            expressionAttributeNames['#message'] = 'message';
            expressionAttributeValues[':message'] = message;
        }

        if (type !== undefined) {
            updateExpressions.push('#type = :type');
            expressionAttributeNames['#type'] = 'type';
            expressionAttributeValues[':type'] = type;
        }

        if (active !== undefined) {
            updateExpressions.push('#active = :active');
            expressionAttributeNames['#active'] = 'active';
            expressionAttributeValues[':active'] = active;
        }

        if (expiresAt !== undefined) {
            updateExpressions.push('#expiresAt = :expiresAt');
            expressionAttributeNames['#expiresAt'] = 'expiresAt';
            expressionAttributeValues[':expiresAt'] = expiresAt;
        }

        // Always update the updatedAt timestamp
        updateExpressions.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        if (updateExpressions.length === 0) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(origin),
                body: JSON.stringify({
                    success: false,
                    error: 'No fields to update'
                })
            };
        }

        // Update announcement
        const updateParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: 'ANNOUNCEMENT',
                sk: `ANNOUNCEMENT#${announcementId}`
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        const updateCommand = new UpdateCommand(updateParams);
        const result = await docClient.send(updateCommand);

        console.log('Announcement updated successfully:', announcementId);

        return {
            statusCode: 200,
            headers: getCorsHeaders(origin, {
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                success: true,
                announcement: {
                    id: result.Attributes.id,
                    title: result.Attributes.title,
                    message: result.Attributes.message,
                    type: result.Attributes.type,
                    active: result.Attributes.active,
                    expiresAt: result.Attributes.expiresAt,
                    createdAt: result.Attributes.createdAt,
                    updatedAt: result.Attributes.updatedAt
                }
            })
        };

    } catch (error) {
        console.error('Update announcement error:', error);
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
