#!/usr/bin/env node

// Seed DynamoDB tables with Taco Delite menu data from menu_rows.csv
// Usage:
//   ENVIRONMENT=staging node seed-dynamodb.js
//   ENVIRONMENT=production node seed-dynamodb.js
//   node seed-dynamodb.js (defaults to staging)
//   node seed-dynamodb.js --clear (clears tables before seeding)

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    ScanCommand,
    BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { readFileSync } from 'fs';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

// Get environment from command line or default to staging
const environment = process.env.ENVIRONMENT || 'staging';

// Check for clear flag
const shouldClear = process.argv.includes('--clear');

// Dynamic table names based on environment
const getTableNames = env => ({
    categories: `tacodelite-app-categories-${env}`,
    menuItems: `tacodelite-app-menu-items-${env}`,
    users: `tacodelite-app-users-${env}`,
    adminUsers: `tacodelite-app-admin-users-${env}`,
});

// Function to clear all items from a table
async function clearTable(tableName) {
    try {
        console.log(`🧹 Clearing table: ${tableName}`);

        // Scan all items
        const scanResult = await docClient.send(
            new ScanCommand({
                TableName: tableName,
            })
        );

        if (scanResult.Items && scanResult.Items.length > 0) {
            // Delete items in batches of 25 (DynamoDB limit)
            const items = scanResult.Items;
            for (let i = 0; i < items.length; i += 25) {
                const batch = items.slice(i, i + 25);
                const deleteRequests = batch.map(item => ({
                    DeleteRequest: {
                        Key: {
                            pk: item.pk,
                            sk: item.sk,
                        },
                    },
                }));

                await docClient.send(
                    new BatchWriteCommand({
                        RequestItems: {
                            [tableName]: deleteRequests,
                        },
                    })
                );
            }
            console.log(`✓ Cleared ${items.length} items from ${tableName}`);
        } else {
            console.log(`✓ Table ${tableName} is already empty`);
        }
    } catch (error) {
        console.error(`✗ Failed to clear table ${tableName}:`, error.message);
        throw error;
    }
}

// Read menu data from local CSV file
async function loadMenuData() {
    try {
        // Read CSV file
        const csvContent = readFileSync('./menu_rows.csv', 'utf8');
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].replace(/\r/g, '').split(',');

        // Parse CSV data
        const categories = [];
        const menuItems = [];
        const categoryMap = new Map();

        // Process each row (skip header)
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row = {};

            // Create object from headers and values
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });

            // Add category if not already added
            if (!categoryMap.has(row.categoryId)) {
                const categoryName =
                    row.category || `Category ${row.categoryId}`;
                categories.push({
                    pk: `CATEGORY#${row.categoryId.toString().padStart(3, '0')}`,
                    id: parseInt(row.categoryId),
                    name: categoryName,
                    description: `${categoryName} items`,
                });
                categoryMap.set(row.categoryId, categoryName);
            }

            // Add menu item with zero-padded keys for proper sorting
            const itemId = parseInt(row.id);
            menuItems.push({
                pk: `ITEM#${itemId.toString().padStart(3, '0')}`,
                sk: `ITEM#${itemId.toString().padStart(3, '0')}`,
                id: itemId,
                categoryId: parseInt(row.categoryId),
                name: row.name,
                description: row.description,
                price: parseFloat(row.price),
                vegetarian: row.vegetarian === 'true',
                active: row.active === 'true',
            });
        }

        return { categories, menuItems };
    } catch (error) {
        console.error('Error loading menu data from CSV:', error);
        throw error;
    }
}

// Helper function to parse CSV line (handles quoted values)
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current.trim());
    return values;
}

async function seedDynamoDB() {
    try {
        console.log(
            `🚀 Starting DynamoDB seeding for ${environment} environment...`
        );
        if (shouldClear) {
            console.log(
                '🧹 Clear flag detected - will clear tables before seeding'
            );
        }

        // Validate environment
        if (!['staging', 'production'].includes(environment)) {
            throw new Error(
                `Invalid environment: ${environment}. Must be 'staging' or 'production'`
            );
        }

        // Get dynamic table names
        const tables = getTableNames(environment);

        // Clear tables if requested
        if (shouldClear) {
            console.log('🧹 Clearing existing data...');
            await clearTable(tables.categories);
            await clearTable(tables.menuItems);
            console.log('✅ Tables cleared successfully');
        }

        // Load menu data from CSV file
        console.log('📂 Loading menu data from CSV file...');
        const { categories, menuItems } = await loadMenuData();
        console.log(
            `📊 Loaded ${categories.length} categories and ${menuItems.length} menu items`
        );

        // Seed Categories
        console.log(`📂 Seeding Categories table: ${tables.categories}`);
        for (const category of categories) {
            try {
                await docClient.send(
                    new PutCommand({
                        TableName: tables.categories,
                        Item: category,
                    })
                );
                console.log(
                    `✓ Seeded category: ${category.name} (ID: ${category.id})`
                );
            } catch (error) {
                console.error(
                    `✗ Failed to seed category ${category.name}:`,
                    error.message
                );
            }
        }

        // Seed Menu Items
        console.log(`🍽️ Seeding Menu Items table: ${tables.menuItems}`);
        for (const item of menuItems) {
            try {
                await docClient.send(
                    new PutCommand({
                        TableName: tables.menuItems,
                        Item: item,
                    })
                );
                console.log(`✓ Seeded item: ${item.name}`);
            } catch (error) {
                console.error(
                    `✗ Failed to seed item ${item.name}:`,
                    error.message
                );
            }
        }

        console.log(`🎉 ${environment} seeding completed successfully!`);
        console.log(
            `📊 Seeded ${categories.length} categories and ${menuItems.length} menu items`
        );
    } catch (error) {
        console.error('❌ Error seeding DynamoDB:', error);
    }
}

seedDynamoDB();
