const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { logActivity } = require('./shared/logActivity');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const ADMIN_USERS_TABLE = process.env.ADMIN_USERS_TABLE;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'https://localhost:3000,https://localhost:5173,http://localhost:3000,http://localhost:5173,https://staging.tacodelitewestplano.com,https://tacodelitewestplano.com';

exports.handler = async (event) => {
    console.log('🚀 Update Admin User Lambda triggered');
    console.log('📝 Event:', JSON.stringify(event, null, 2));

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        'Content-Type': 'application/json'
    };

    try {
        // Handle preflight OPTIONS request
        if (event.httpMethod === 'OPTIONS') {
            console.log('✅ Handling OPTIONS preflight request');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'CORS preflight successful' })
            };
        }

        // Extract user ID from path parameters
        const userId = event.pathParameters?.id;
        if (!userId) {
            console.error('❌ Missing user ID in path parameters');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'User ID is required',
                    details: 'Missing user ID in path parameters'
                })
            };
        }

        // Parse request body
        let updateData;
        try {
            updateData = JSON.parse(event.body);
        } catch (parseError) {
            console.error('❌ Error parsing request body:', parseError);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Invalid JSON in request body',
                    details: parseError.message
                })
            };
        }

        // Validate update data
        const { name, email, permissions, active } = updateData;

        if (!name && !email && !permissions && active === undefined) {
            console.error('❌ No valid update fields provided');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'No valid update fields provided',
                    validFields: ['name', 'email', 'permissions', 'active']
                })
            };
        }

        // Validate email format if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.error('❌ Invalid email format');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: 'Invalid email format'
                    })
                };
            }
        }

        // Build update expression dynamically
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        if (name) {
            updateExpressions.push('#name = :name');
            expressionAttributeNames['#name'] = 'name';
            expressionAttributeValues[':name'] = name.trim();
        }

        if (email) {
            updateExpressions.push('#email = :email');
            expressionAttributeNames['#email'] = 'email';
            expressionAttributeValues[':email'] = email.toLowerCase().trim();
        }

        if (permissions) {
            updateExpressions.push('#permissions = :permissions');
            expressionAttributeNames['#permissions'] = 'permissions';
            expressionAttributeValues[':permissions'] = permissions;
        }

        if (active !== undefined) {
            updateExpressions.push('#active = :active');
            expressionAttributeNames['#active'] = 'active';
            expressionAttributeValues[':active'] = active;
        }

        // Add updated timestamp
        updateExpressions.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        const updateCommand = new UpdateCommand({
            TableName: ADMIN_USERS_TABLE,
            Key: {
                pk: `ADMIN#${userId}`
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        });

        console.log('📝 Updating admin user:', userId, 'with data:', updateData);

        const result = await docClient.send(updateCommand);
        console.log('✅ Admin user updated successfully');

        // Log activity
        await logActivity(
            'user',
            'updated',
            updateData.email || 'Unknown User',
            userId,
            null, // userId
            null, // userName
            event // Pass event to extract user info from headers
        );

        // Return success response (without password if it exists)
        const updatedUser = result.Attributes;
        if (updatedUser.password) {
            delete updatedUser.password;
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Admin user updated successfully',
                user: updatedUser
            })
        };

    } catch (error) {
        console.error('❌ Error updating admin user:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to update admin user',
                details: error.message
            })
        };
    }
};
