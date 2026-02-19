#!/usr/bin/env node

/**
 * Modifier Groups and Modifiers Seeding Script (Redesigned)
 *
 * Clean migration: Replaces old modifier system with simplified structure:
 * - 3 groups: LUNCH, BREAKFAST, FAMILY
 * - Modifiers have priceSm and priceLg (no duplicate sm/lg modifiers)
 * - Menu items get portionSize (sm/lg) or unitCount (Family)
 * - Modifier group derived from categoryId
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    BatchWriteCommand,
    ScanCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME =
    process.env.DYNAMODB_TABLE || 'tacodelite-app-menu-items-staging';

/**
 * New Modifier Groups: LUNCH, BREAKFAST, FAMILY
 */
const MODIFIER_GROUPS = [
    {
        id: 'LUNCH',
        name: 'Lunch',
        description: 'Add-ons for lunch items (tacos, burritos, salads, etc.)',
        sortOrder: 1,
        active: true,
    },
    {
        id: 'BREAKFAST',
        name: 'Breakfast',
        description: 'Add-ons for breakfast items',
        sortOrder: 2,
        active: true,
    },
    {
        id: 'FAMILY',
        name: 'Family',
        description: 'Add-ons for family packs (quantity × small price)',
        sortOrder: 3,
        active: true,
    },
];

/**
 * LUNCH modifiers - merged from old SMALL_ADDONS and LARGE_ADDONS
 * Each has priceSm and priceLg
 */
const LUNCH_MODIFIERS = [
    // Protein choices (included)
    {
        id: 'GROUND_BEEF',
        name: 'Ground Beef',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 1,
    },
    {
        id: 'CHICKEN_FAJITA',
        name: 'Chicken Fajita',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 2,
    },
    {
        id: 'STEAK_FAJITA',
        name: 'Steak Fajita',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 3,
    },
    {
        id: 'SHREDDED_CHICKEN',
        name: 'Shredded Chicken',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 4,
    },
    // Base toppings (included)
    {
        id: 'LETTUCE',
        name: 'Lettuce',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 5,
    },
    {
        id: 'SHREDDED_CHEESE',
        name: 'Shredded Cheese',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 6,
    },
    {
        id: 'HOMEMADE_BEANS',
        name: 'Homemade Beans',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 7,
    },
    // Add-ons (sm/lg pricing)
    {
        id: 'TOMATOES',
        name: 'Tomatoes',
        priceSm: 0.5,
        priceLg: 0.75,
        priceType: 'addon',
        sortOrder: 8,
    },
    {
        id: 'SOUR_CREAM',
        name: 'Sour Cream',
        priceSm: 0.5,
        priceLg: 0.75,
        priceType: 'addon',
        sortOrder: 9,
    },
    {
        id: 'GUACAMOLE',
        name: 'Guacamole',
        priceSm: 1.5,
        priceLg: 2.0,
        priceType: 'addon',
        sortOrder: 10,
    },
    {
        id: 'QUESO',
        name: 'Queso',
        priceSm: 1.0,
        priceLg: 1.5,
        priceType: 'addon',
        sortOrder: 11,
    },
    {
        id: 'JALAPENOS',
        name: 'Jalapeños',
        priceSm: 0.25,
        priceLg: 0.25,
        priceType: 'addon',
        sortOrder: 12,
    },
    {
        id: 'BELL_PEPPERS_ONIONS',
        name: 'Bell Peppers & Onions',
        priceSm: 1.0,
        priceLg: 1.0,
        priceType: 'addon',
        sortOrder: 13,
    },
    {
        id: 'PICO_DE_GALLO',
        name: 'Pico de Gallo',
        priceSm: 0.5,
        priceLg: 0.5,
        priceType: 'addon',
        sortOrder: 14,
    },
    // Sauce options (included)
    {
        id: 'CHILI_CON_CARNE',
        name: 'Chili con Carne',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 15,
    },
    {
        id: 'SOUR_CREAM_SAUCE',
        name: 'Sour Cream Sauce',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 16,
    },
    {
        id: 'BURRITO_SAUCE',
        name: 'Special Burrito Sauce',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 17,
    },
    // Removal options
    {
        id: 'NO_LETTUCE',
        name: 'No Lettuce',
        priceSm: 0,
        priceLg: 0,
        priceType: 'removal',
        sortOrder: 18,
    },
    {
        id: 'NO_CHEESE',
        name: 'No Cheese',
        priceSm: 0,
        priceLg: 0,
        priceType: 'removal',
        sortOrder: 19,
    },
    {
        id: 'NO_TOMATOES',
        name: 'No Tomatoes',
        priceSm: 0,
        priceLg: 0,
        priceType: 'removal',
        sortOrder: 20,
    },
    {
        id: 'NO_SOUR_CREAM',
        name: 'No Sour Cream',
        priceSm: 0,
        priceLg: 0,
        priceType: 'removal',
        sortOrder: 21,
    },
    {
        id: 'NO_BEANS',
        name: 'No Beans',
        priceSm: 0,
        priceLg: 0,
        priceType: 'removal',
        sortOrder: 22,
    },
    {
        id: 'NO_JALAPENOS',
        name: 'No Jalapeños',
        priceSm: 0,
        priceLg: 0,
        priceType: 'removal',
        sortOrder: 23,
    },
];

/**
 * BREAKFAST modifiers - taco=sm, burrito/bowl/quesadilla=lg
 */
const BREAKFAST_MODIFIERS = [
    // Protein choices
    {
        id: 'EGG_SAUSAGE',
        name: 'Egg & Sausage',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 1,
    },
    {
        id: 'EGG_CHORIZO',
        name: 'Egg & Chorizo',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 2,
    },
    // Base toppings
    {
        id: 'SHREDDED_CHEESE',
        name: 'Shredded Cheese',
        priceSm: 0,
        priceLg: 0,
        priceType: 'included',
        sortOrder: 3,
    },
    // Breakfast add-ons (sm=0.50, lg=0.75 for single; both=0.99/1.49)
    {
        id: 'FRESH_POTATOES',
        name: 'Fresh Cut Potatoes',
        priceSm: 0.5,
        priceLg: 0.75,
        priceType: 'addon',
        sortOrder: 4,
    },
    {
        id: 'BACON',
        name: 'Bacon',
        priceSm: 0.5,
        priceLg: 0.75,
        priceType: 'addon',
        sortOrder: 5,
    },
    {
        id: 'POTATOES_BACON',
        name: 'Both Potatoes & Bacon',
        priceSm: 0.99,
        priceLg: 1.49,
        priceType: 'addon',
        sortOrder: 6,
    },
    // Removal options
    {
        id: 'NO_LETTUCE',
        name: 'No Lettuce',
        priceSm: 0,
        priceLg: 0,
        priceType: 'removal',
        sortOrder: 7,
    },
    {
        id: 'NO_CHEESE',
        name: 'No Cheese',
        priceSm: 0,
        priceLg: 0,
        priceType: 'removal',
        sortOrder: 8,
    },
];

/**
 * FAMILY modifiers - same as LUNCH, uses unitCount × priceSm
 */
const FAMILY_MODIFIERS = LUNCH_MODIFIERS;

/**
 * Delete old modifier groups and modifiers (clean migration)
 */
async function deleteOldModifiers() {
    console.log('Deleting old modifier groups and modifiers...');

    const scanResult = await docClient.send(
        new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression:
                'begins_with(pk, :groupPrefix) OR begins_with(pk, :modPrefix)',
            ExpressionAttributeValues: {
                ':groupPrefix': 'MODIFIER_GROUP#',
                ':modPrefix': 'MODIFIER#',
            },
        })
    );

    const items = scanResult.Items || [];
    if (items.length === 0) {
        console.log('No existing modifiers to delete');
        return;
    }

    for (let i = 0; i < items.length; i += 25) {
        const batch = items.slice(i, i + 25);
        const deleteRequests = batch.map(item => ({
            DeleteRequest: {
                Key: { pk: item.pk, sk: item.sk },
            },
        }));

        await docClient.send(
            new BatchWriteCommand({
                RequestItems: {
                    [TABLE_NAME]: deleteRequests,
                },
            })
        );
    }
    console.log(`Deleted ${items.length} old modifier/modifier group items`);
}

/**
 * Create modifier groups
 */
async function createModifierGroups() {
    console.log('Creating modifier groups...');

    const groups = MODIFIER_GROUPS.map(group => ({
        pk: `MODIFIER_GROUP#${group.id}`,
        sk: `MODIFIER_GROUP#${group.id}`,
        id: group.id,
        name: group.name,
        description: group.description || '',
        sortOrder: group.sortOrder,
        active: group.active,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    for (let i = 0; i < groups.length; i += 25) {
        const batch = groups.slice(i, i + 25);
        const putRequests = batch.map(item => ({ PutRequest: { Item: item } }));
        await docClient.send(
            new BatchWriteCommand({
                RequestItems: { [TABLE_NAME]: putRequests },
            })
        );
    }
    console.log(`Created ${groups.length} modifier groups`);
}

/**
 * Create modifiers for a group
 */
function createModifiersForGroup(groupId, modifiers, groupName) {
    return modifiers.map(mod => ({
        pk: `MODIFIER#${groupId}`,
        sk: `MODIFIER#${mod.id}`,
        id: mod.id,
        name: mod.name,
        groupId,
        groupName,
        priceSm: mod.priceSm ?? 0,
        priceLg: mod.priceLg ?? 0,
        priceType: mod.priceType || 'addon',
        defaultSelected: false,
        sortOrder: mod.sortOrder || 0,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));
}

/**
 * Create all modifiers
 */
async function createModifiers() {
    console.log('Creating modifiers...');

    const allModifiers = [
        ...createModifiersForGroup('LUNCH', LUNCH_MODIFIERS, 'Lunch'),
        ...createModifiersForGroup(
            'BREAKFAST',
            BREAKFAST_MODIFIERS,
            'Breakfast'
        ),
        ...createModifiersForGroup('FAMILY', FAMILY_MODIFIERS, 'Family'),
    ];

    for (let i = 0; i < allModifiers.length; i += 25) {
        const batch = allModifiers.slice(i, i + 25);
        const putRequests = batch.map(item => ({ PutRequest: { Item: item } }));
        await docClient.send(
            new BatchWriteCommand({
                RequestItems: { [TABLE_NAME]: putRequests },
            })
        );
    }
    console.log(`Created ${allModifiers.length} modifiers`);
}

/**
 * Determine portionSize or unitCount for a menu item
 */
function getItemModifierAttrs(item) {
    const categoryId = item.categoryId;
    const name = (item.name || '').toLowerCase();

    // Desserts (13) and Drinks (14) - no modifiers
    if (categoryId === 13 || categoryId === 14) {
        return { portionSize: null, unitCount: null };
    }

    // Family (12) - unitCount
    if (categoryId === 12) {
        if (name.includes('10 pack') || name.includes('10 tacos'))
            return { portionSize: null, unitCount: 10 };
        if (name.includes('dozen') || name.includes('12 '))
            return { portionSize: null, unitCount: 12 };
        if (name.includes('gallon') || name.includes('bag of'))
            return { portionSize: null, unitCount: 1 };
        return { portionSize: null, unitCount: 1 };
    }

    // Breakfast (1) - portionSize: taco=sm, burrito/bowl/quesadilla=lg
    if (categoryId === 1) {
        if (
            name.includes('taco') &&
            !name.includes('burrito') &&
            !name.includes('quesadilla')
        ) {
            return { portionSize: 'sm', unitCount: null };
        }
        return { portionSize: 'lg', unitCount: null };
    }

    // Lunch categories (2-11) - portionSize
    const smPatterns = [
        'taco',
        'tostada',
        'side',
        'extra',
        'taquito',
        'tamale',
        'enchilada',
        'cookie',
        'chips',
    ];
    const lgPatterns = [
        'burrito',
        'bowl',
        'salad',
        'nachos',
        'quesadilla',
        'plate',
        'soup',
        'frito',
        'burger',
    ];

    if (smPatterns.some(p => name.includes(p)))
        return { portionSize: 'sm', unitCount: null };
    if (lgPatterns.some(p => name.includes(p)))
        return { portionSize: 'lg', unitCount: null };

    // Chips-n-Stuff, Dinners - default to lg
    return { portionSize: 'lg', unitCount: null };
}

/**
 * Update menu items with portionSize/unitCount, remove modifierGroups
 */
async function updateMenuItems() {
    console.log('Updating menu items with portionSize/unitCount...');

    const scanResult = await docClient.send(
        new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'begins_with(pk, :itemPrefix) AND pk = sk',
            ExpressionAttributeValues: { ':itemPrefix': 'ITEM#' },
        })
    );

    const items = scanResult.Items || [];
    let updated = 0;
    const now = new Date().toISOString();

    for (const item of items) {
        const { portionSize, unitCount } = getItemModifierAttrs(item);

        const setParts = ['#updatedAt = :updatedAt'];
        const exprNames = { '#updatedAt': 'updatedAt' };
        const exprValues = { ':updatedAt': now };

        if (portionSize !== undefined && portionSize !== null) {
            setParts.push('#portionSize = :portionSize');
            exprNames['#portionSize'] = 'portionSize';
            exprValues[':portionSize'] = portionSize;
        }
        if (unitCount !== undefined && unitCount !== null) {
            setParts.push('#unitCount = :unitCount');
            exprNames['#unitCount'] = 'unitCount';
            exprValues[':unitCount'] = unitCount;
        }

        const updateExpression = `SET ${setParts.join(', ')} REMOVE modifierGroups`;

        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { pk: item.pk, sk: item.sk },
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: exprNames,
                ExpressionAttributeValues: exprValues,
            })
        );
        updated++;
    }

    console.log(`Updated ${updated} menu items`);
}

/**
 * Main execution
 */
async function main() {
    try {
        console.log('Starting modifier system seeding (clean migration)...');
        console.log(`Using table: ${TABLE_NAME}`);

        await deleteOldModifiers();
        await createModifierGroups();
        await createModifiers();
        await updateMenuItems();

        console.log('\nModifier system seeding completed successfully!');
        console.log('\n=== SUMMARY ===');
        console.log(
            `Modifier Groups: ${MODIFIER_GROUPS.length} (LUNCH, BREAKFAST, FAMILY)`
        );
        console.log(`LUNCH modifiers: ${LUNCH_MODIFIERS.length}`);
        console.log(`BREAKFAST modifiers: ${BREAKFAST_MODIFIERS.length}`);
        console.log(
            `FAMILY modifiers: ${FAMILY_MODIFIERS.length} (same as LUNCH)`
        );
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    MODIFIER_GROUPS,
    LUNCH_MODIFIERS,
    BREAKFAST_MODIFIERS,
    FAMILY_MODIFIERS,
    deleteOldModifiers,
    createModifierGroups,
    createModifiers,
    updateMenuItems,
};
