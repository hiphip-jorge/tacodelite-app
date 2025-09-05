const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const ADMIN_USERS_TABLE = process.env.ADMIN_USERS_TABLE || 'tacodelite-app-admin-users-staging';

async function hashPassword(password) {
    return await bcrypt.hash(password, 12);
}

function generateSecurePassword() {
    // Generate a secure random password
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
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
            lastLogin: null
        }
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

async function seedAdminUsers() {
    console.log('🌱 Seeding admin users...');
    console.log('🔐 Generating secure credentials...\n');

    // Generate secure credentials
    const securePassword = generateSecurePassword();

    const adminUsers = [
        {
            id: 'ADMIN#001',
            email: 'admin@tacodelite.com',
            name: 'Admin User',
            password: securePassword,
            role: 'admin',
            active: true
        }
    ];

    let successCount = 0;
    for (const user of adminUsers) {
        const passwordHash = await hashPassword(user.password);
        const success = await createAdminUser({
            ...user,
            passwordHash
        });
        if (success) successCount++;
    }

    console.log(`\n✅ Admin users seeding complete! (${successCount}/${adminUsers.length} created)`);

    // Display credentials securely
    console.log('\n🔐 ADMIN CREDENTIALS (SAVE THESE SECURELY):');
    console.log('==========================================');
    console.log(`Email: ${adminUsers[0].email}`);
    console.log(`Password: ${adminUsers[0].password}`);
    console.log('==========================================');

    console.log('\n⚠️  SECURITY IMPORTANT:');
    console.log('  - Save these credentials securely');
    console.log('  - Share only with authorized personnel');
    console.log('  - Change password after first login');
    console.log('  - Consider using a password manager');
    console.log('  - Delete this output after saving credentials');

    console.log('\n📧 For password reset, contact: tacodelitewestplano@gmail.com');
}

// Run the seeding
seedAdminUsers().catch(console.error);
