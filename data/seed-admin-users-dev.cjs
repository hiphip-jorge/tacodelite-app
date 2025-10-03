const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const ADMIN_USERS_TABLE =
    process.env.ADMIN_USERS_TABLE || 'tacodelite-app-admin-users-staging';

async function hashPassword(password) {
    return await bcrypt.hash(password, 12);
}

async function createAdminUser(userData) {
    const params = {
        TableName: ADMIN_USERS_TABLE,
        Item: {
            pk: userData.id,
            email: userData.email.toLowerCase(),
            name: userData.name,
            passwordHash: userData.passwordHash,
            role: userData.role,
            active: userData.active,
            createdAt: new Date().toISOString(),
            lastLogin: null,
        },
    };

    try {
        await dynamodb.put(params).promise();
        console.log(`✅ Created admin user: ${userData.email}`);
        return true;
    } catch (error) {
        console.error(`❌ Error creating admin user ${userData.email}:`, error);
        return false;
    }
}

async function seedAdminUsersDev() {
    console.log('🌱 Seeding admin users for DEVELOPMENT...');
    console.log(
        '⚠️  WARNING: This uses predictable credentials for testing only!\n'
    );

    const adminUsers = [
        {
            id: 'ADMIN#001',
            email: 'admin@tacodelite.com',
            name: 'Admin User',
            password: 'password123', // Development only - predictable for testing
            role: 'admin',
            active: true,
        },
    ];

    let successCount = 0;
    for (const user of adminUsers) {
        const passwordHash = await hashPassword(user.password);
        const success = await createAdminUser({
            ...user,
            passwordHash,
        });
        if (success) successCount++;
    }

    console.log(
        `\n✅ Development admin users seeding complete! (${successCount}/${adminUsers.length} created)`
    );

    console.log('\n📋 DEVELOPMENT CREDENTIALS:');
    console.log('==========================');
    console.log(`Email: ${adminUsers[0].email}`);
    console.log(`Password: ${adminUsers[0].password}`);
    console.log('==========================');

    console.log('\n⚠️  DEVELOPMENT ONLY:');
    console.log('  - These credentials are for development/testing only');
    console.log('  - DO NOT use in production');
    console.log(
        '  - Use seed-admin-users.js for production with secure credentials'
    );
}

// Run the seeding
seedAdminUsersDev().catch(console.error);
