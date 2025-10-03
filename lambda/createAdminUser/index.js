const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { logActivity } = require('./shared/logActivity');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

const ADMIN_USERS_TABLE = process.env.ADMIN_USERS_TABLE;
const ALLOWED_ORIGINS =
    process.env.ALLOWED_ORIGINS ||
    'https://localhost:3000,https://localhost:5173,http://localhost:3000,http://localhost:5173,,https://staging.tacodelitewestplano.com';

exports.handler = async event => {
    console.log('🚀 Create Admin User Lambda triggered');
    console.log('📝 Event:', JSON.stringify(event, null, 2));

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
        'Access-Control-Allow-Headers':
            'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Content-Type': 'application/json',
    };

    try {
        // Handle preflight OPTIONS request
        if (event.httpMethod === 'OPTIONS') {
            console.log('✅ Handling OPTIONS preflight request');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'CORS preflight successful' }),
            };
        }

        // Parse request body
        let userData;
        try {
            userData = JSON.parse(event.body);
        } catch (parseError) {
            console.error('❌ Error parsing request body:', parseError);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Invalid JSON in request body',
                    details: parseError.message,
                }),
            };
        }

        // Validate required fields
        const { name, email, password, permissions = [] } = userData;

        if (!name || !email || !password) {
            console.error('❌ Missing required fields');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required fields',
                    required: ['name', 'email', 'password'],
                }),
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('❌ Invalid email format');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Invalid email format',
                }),
            };
        }

        // Generate unique ID (simple timestamp-based for now)
        const userId = Date.now().toString();

        // Create user object
        const newUser = {
            pk: `ADMIN#${userId}`,
            id: userId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password, // In production, this should be hashed
            permissions: permissions,
            role: 'admin',
            active: true,
            createdAt: new Date().toISOString(),
            lastLogin: null,
        };

        console.log('📝 Creating admin user:', newUser);

        // Save to DynamoDB
        const putCommand = new PutCommand({
            TableName: ADMIN_USERS_TABLE,
            Item: newUser,
        });

        await docClient.send(putCommand);
        console.log('✅ Admin user created successfully');

        // Log activity
        await logActivity(
            'user',
            'created',
            userData.email,
            newUser.id,
            null, // userId
            null, // userName
            event // Pass event to extract user info from headers
        );

        // Return success response (without password)
        const userResponse = { ...newUser };
        delete userResponse.password;

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                message: 'Admin user created successfully',
                user: userResponse,
            }),
        };
    } catch (error) {
        console.error('❌ Error creating admin user:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to create admin user',
                details: error.message,
            }),
        };
    }
};
