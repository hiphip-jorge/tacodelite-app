#!/usr/bin/env node

// Seed DynamoDB tables with Taco Delite menu data
// Usage: node seed-dynamodb.js

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function seedDynamoDB() {
    try {
        console.log('Starting DynamoDB seeding...');

        // Read the menu data
        const menuData = await import('./mocks/menu.json');

        const tableName = 'tacodelite-menu-staging';

        console.log(`Seeding table: ${tableName}`);
        console.log(`Found ${menuData.default.length} items to seed`);

        // Seed the data
        for (const item of menuData.default) {
            try {
                await docClient.send(new PutCommand({
                    TableName: tableName,
                    Item: item
                }));
                console.log(`✓ Seeded: ${item.name}`);
            } catch (error) {
                console.error(`✗ Failed to seed ${item.name}:`, error.message);
            }
        }

        console.log('Seeding completed!');

    } catch (error) {
        console.error('Error seeding DynamoDB:', error);
    }
}

seedDynamoDB();
