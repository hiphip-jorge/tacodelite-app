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
    // Protein choices (included - price 0, menu item decides via defaultSelections)
    {
        id: 'GROUND_BEEF',
        name: 'Ground Beef',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 1,
    },
    {
        id: 'CHICKEN_FAJITA',
        name: 'Chicken Fajita',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 2,
    },
    {
        id: 'STEAK_FAJITA',
        name: 'Steak Fajita',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 3,
    },
    {
        id: 'SHREDDED_CHICKEN',
        name: 'Shredded Chicken',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 4,
    },
    // Base toppings (included)
    {
        id: 'LETTUCE',
        name: 'Lettuce',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 5,
    },
    {
        id: 'SHREDDED_CHEESE',
        name: 'Shredded Cheese',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 6,
    },
    {
        id: 'HOMEMADE_BEANS',
        name: 'Homemade Beans',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 7,
    },
    // Add-ons (sm/lg pricing - charged when in availableAddons)
    {
        id: 'TOMATOES',
        name: 'Tomatoes',
        priceSm: 0.5,
        priceLg: 0.75,
        sortOrder: 8,
    },
    {
        id: 'SOUR_CREAM',
        name: 'Sour Cream',
        priceSm: 0.5,
        priceLg: 0.75,
        sortOrder: 9,
    },
    {
        id: 'GUACAMOLE',
        name: 'Guacamole',
        priceSm: 1.5,
        priceLg: 2.0,
        sortOrder: 10,
    },
    {
        id: 'QUESO',
        name: 'Queso',
        priceSm: 1.0,
        priceLg: 1.5,
        sortOrder: 11,
    },
    {
        id: 'JALAPENOS',
        name: 'Jalapeños',
        priceSm: 0.25,
        priceLg: 0.25,
        sortOrder: 12,
    },
    {
        id: 'BELL_PEPPERS_ONIONS',
        name: 'Bell Peppers & Onions',
        priceSm: 1.0,
        priceLg: 1.0,
        sortOrder: 13,
    },
    {
        id: 'PICO_DE_GALLO',
        name: 'Pico de Gallo',
        priceSm: 0.5,
        priceLg: 0.5,
        sortOrder: 14,
    },
    // Sauce options (included)
    {
        id: 'CHILI_CON_CARNE',
        name: 'Chili con Carne',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 15,
    },
    {
        id: 'SOUR_CREAM_SAUCE',
        name: 'Sour Cream Sauce',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 16,
    },
    {
        id: 'BURRITO_SAUCE',
        name: 'Special Burrito Sauce',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 17,
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
        sortOrder: 1,
    },
    {
        id: 'EGG_CHORIZO',
        name: 'Egg & Chorizo',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 2,
    },
    // Base toppings
    {
        id: 'SHREDDED_CHEESE',
        name: 'Shredded Cheese',
        priceSm: 0,
        priceLg: 0,
        sortOrder: 3,
    },
    // Breakfast add-ons
    {
        id: 'FRESH_POTATOES',
        name: 'Fresh Cut Potatoes',
        priceSm: 0.5,
        priceLg: 0.75,
        sortOrder: 4,
    },
    {
        id: 'BACON',
        name: 'Bacon',
        priceSm: 0.5,
        priceLg: 0.75,
        sortOrder: 5,
    },
    {
        id: 'POTATOES_BACON',
        name: 'Both Potatoes & Bacon',
        priceSm: 0.99,
        priceLg: 1.49,
        sortOrder: 6,
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

/** Default included modifiers for LUNCH items (base toppings) */
const LUNCH_DEFAULT_SELECTIONS = [
    'LETTUCE',
    'SHREDDED_CHEESE',
    'HOMEMADE_BEANS',
    'TOMATOES',
    'SOUR_CREAM',
    'JALAPENOS',
];

/** Default included modifiers for BREAKFAST items */
const BREAKFAST_DEFAULT_SELECTIONS = ['EGG_SAUSAGE', 'SHREDDED_CHEESE'];

/** Default included modifiers for FAMILY (same as LUNCH) */
const FAMILY_DEFAULT_SELECTIONS = LUNCH_DEFAULT_SELECTIONS;

/**
 * Determine portionSize, unitCount, modifierGroupId, and defaultSelections for a menu item
 */
function getItemModifierAttrs(item) {
    const categoryId = item.categoryId;
    const name = (item.name || '').toLowerCase();

    // Desserts (13) and Drinks (14) - no modifiers
    if (categoryId === 13 || categoryId === 14) {
        return {
            portionSize: null,
            unitCount: null,
            modifierGroupId: null,
            defaultSelections: [],
        };
    }

    // Family (12) - unitCount, FAMILY group
    if (categoryId === 12) {
        let unitCount = 1;
        if (name.includes('10 pack') || name.includes('10 tacos'))
            unitCount = 10;
        else if (name.includes('dozen') || name.includes('12 ')) unitCount = 12;
        else if (name.includes('gallon') || name.includes('bag of'))
            unitCount = 1;
        return {
            portionSize: null,
            unitCount,
            modifierGroupId: 'FAMILY',
            defaultSelections: FAMILY_DEFAULT_SELECTIONS,
        };
    }

    // Breakfast (1) - portionSize: taco=sm, burrito/bowl/quesadilla=lg
    if (categoryId === 1) {
        const portionSize =
            name.includes('taco') &&
            !name.includes('burrito') &&
            !name.includes('quesadilla')
                ? 'sm'
                : 'lg';
        return {
            portionSize,
            unitCount: null,
            modifierGroupId: 'BREAKFAST',
            defaultSelections: BREAKFAST_DEFAULT_SELECTIONS,
        };
    }

    // Lunch categories (2-11) - portionSize, LUNCH group
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

    let portionSize = 'lg';
    if (smPatterns.some(p => name.includes(p))) portionSize = 'sm';
    else if (lgPatterns.some(p => name.includes(p))) portionSize = 'lg';

    return {
        portionSize,
        unitCount: null,
        modifierGroupId: 'LUNCH',
        defaultSelections: LUNCH_DEFAULT_SELECTIONS,
    };
}

/**
 * Update menu items with portionSize, unitCount, modifierGroupId, defaultSelections
 */
async function updateMenuItems() {
    console.log(
        'Updating menu items with portionSize, unitCount, modifierGroupId, defaultSelections...'
    );

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
        const { portionSize, unitCount, modifierGroupId, defaultSelections } =
            getItemModifierAttrs(item);

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
        if (modifierGroupId !== undefined && modifierGroupId !== null) {
            setParts.push('#modifierGroupId = :modifierGroupId');
            exprNames['#modifierGroupId'] = 'modifierGroupId';
            exprValues[':modifierGroupId'] = modifierGroupId;
        }
        if (
            defaultSelections !== undefined &&
            Array.isArray(defaultSelections) &&
            defaultSelections.length > 0
        ) {
            setParts.push('#defaultSelections = :defaultSelections');
            exprNames['#defaultSelections'] = 'defaultSelections';
            exprValues[':defaultSelections'] = defaultSelections;
        }

        // For items with no modifiers (Desserts, Drinks), remove modifier attrs if present
        const removeParts = [];
        if (!modifierGroupId) {
            removeParts.push('modifierGroupId');
        }
        if (!defaultSelections || defaultSelections.length === 0) {
            removeParts.push('defaultSelections');
        }
        removeParts.push('modifierGroups'); // legacy

        const updateExpression =
            removeParts.length > 0
                ? `SET ${setParts.join(', ')} REMOVE ${removeParts.join(', ')}`
                : `SET ${setParts.join(', ')}`;

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
