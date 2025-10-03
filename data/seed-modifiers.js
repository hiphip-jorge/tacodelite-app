#!/usr/bin/env node

/**
 * Modifier Groups and Modifiers Seeding Script
 *
 * This script creates a comprehensive modifier system based on the menu analysis.
 * It handles the hierarchical nature of items (base → supreme) and provides
 * efficient ingredient reuse across different menu categories.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME =
    process.env.DYNAMODB_TABLE || 'tacodelite-app-menu-items-staging';

/**
 * Modifier Groups Configuration
 * Organized by ingredient type and usage context
 */
const MODIFIER_GROUPS = [
    // Base protein choices - required for most items
    {
        id: 'PROTEIN_CHOICES',
        name: 'Protein Choice',
        description: 'Select your protein option',
        sortOrder: 1,
        required: true,
        multiSelect: false,
        min: 1,
        max: 1,
    },

    // Standard toppings that come with most items
    {
        id: 'BASE_TOPPINGS',
        name: 'Standard Toppings',
        description: 'Standard toppings included with your item',
        sortOrder: 2,
        required: false,
        multiSelect: true,
        min: 0,
        max: null,
    },

    // Small add-ons for tacos and smaller items
    {
        id: 'SMALL_ADDONS',
        name: 'Small Add-ons',
        description: 'Small add-ons for tacos and smaller items',
        sortOrder: 3,
        required: false,
        multiSelect: true,
        min: 0,
        max: null,
    },

    // Large portion add-ons for burritos, salads, plates
    {
        id: 'LARGE_ADDONS',
        name: 'Large Add-ons',
        description: 'Premium ingredients for burritos, salads, and plates',
        sortOrder: 4,
        required: false,
        multiSelect: true,
        min: 0,
        max: null,
    },

    // Breakfast-specific add-ons
    {
        id: 'BREAKFAST_ADDONS',
        name: 'Breakfast Add-ons',
        description: 'Breakfast-specific add-ons',
        sortOrder: 5,
        required: false,
        multiSelect: true,
        min: 0,
        max: null,
    },

    // Sauce and topping options
    {
        id: 'SAUCE_OPTIONS',
        name: 'Sauce & Topping Options',
        description: 'Choose your sauce and premium toppings',
        sortOrder: 6,
        required: false,
        multiSelect: true,
        min: 0,
        max: null,
    },

    // Removal options for dietary restrictions
    {
        id: 'REMOVAL_OPTIONS',
        name: 'Remove Items',
        description: 'Remove ingredients for dietary preferences',
        sortOrder: 7,
        required: false,
        multiSelect: true,
        min: 0,
        max: null,
    },
];

/**
 * Modifiers Configuration
 * Organized by group with pricing and default selection logic
 */
const MODIFIERS = {
    // Protein choices - these are the base proteins
    PROTEIN_CHOICES: [
        {
            id: 'GROUND_BEEF',
            name: 'Ground Beef',
            price: 0,
            priceType: 'included',
            defaultSelected: true,
            sortOrder: 1,
        },
        {
            id: 'CHICKEN_FAJITA',
            name: 'Chicken Fajita',
            price: 0,
            priceType: 'included',
            defaultSelected: false,
            sortOrder: 2,
        },
        {
            id: 'STEAK_FAJITA',
            name: 'Steak Fajita',
            price: 0,
            priceType: 'included',
            defaultSelected: false,
            sortOrder: 3,
        },
        {
            id: 'SHREDDED_CHICKEN',
            name: 'Shredded Chicken',
            price: 0,
            priceType: 'included',
            defaultSelected: false,
            sortOrder: 4,
        },
        {
            id: 'EGG_SAUSAGE',
            name: 'Egg & Sausage',
            price: 0,
            priceType: 'included',
            defaultSelected: true,
            sortOrder: 5,
        },
        {
            id: 'EGG_CHORIZO',
            name: 'Egg & Chorizo',
            price: 0,
            priceType: 'included',
            defaultSelected: false,
            sortOrder: 6,
        },
    ],

    // Base toppings that come standard
    BASE_TOPPINGS: [
        {
            id: 'LETTUCE',
            name: 'Lettuce',
            price: 0,
            priceType: 'included',
            defaultSelected: true,
            sortOrder: 1,
        },
        {
            id: 'SHREDDED_CHEESE',
            name: 'Shredded Cheese',
            price: 0,
            priceType: 'included',
            defaultSelected: true,
            sortOrder: 2,
        },
        {
            id: 'HOMEMADE_BEANS',
            name: 'Homemade Beans',
            price: 0,
            priceType: 'included',
            defaultSelected: false,
            sortOrder: 3,
        },
    ],

    // Small add-ons for tacos and smaller items
    SMALL_ADDONS: [
        {
            id: 'TOMATOES',
            name: 'Tomatoes',
            price: 0.5,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 1,
        },
        {
            id: 'SOUR_CREAM',
            name: 'Sour Cream',
            price: 0.5,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 2,
        },
        {
            id: 'GUACAMOLE',
            name: 'Guacamole',
            price: 1.5,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 3,
        },
        {
            id: 'QUESO',
            name: 'Queso',
            price: 1.0,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 4,
        },
        {
            id: 'JALAPENOS',
            name: 'Jalapeños',
            price: 0.25,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 5,
        },
    ],

    // Large add-ons for burritos, salads, plates
    LARGE_ADDONS: [
        {
            id: 'TOMATOES_LG',
            name: 'Tomatoes',
            price: 0.75,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 1,
        },
        {
            id: 'SOUR_CREAM_LG',
            name: 'Sour Cream',
            price: 0.75,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 2,
        },
        {
            id: 'GUACAMOLE_LG',
            name: 'Guacamole',
            price: 2.0,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 3,
        },
        {
            id: 'QUESO_LG',
            name: 'Queso',
            price: 1.5,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 4,
        },
        {
            id: 'BELL_PEPPERS_ONIONS',
            name: 'Bell Peppers & Onions',
            price: 1.0,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 5,
        },
        {
            id: 'PICO_DE_GALLO',
            name: 'Pico de Gallo',
            price: 0.5,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 6,
        },
    ],

    // Breakfast-specific add-ons
    BREAKFAST_ADDONS: [
        {
            id: 'FRESH_POTATOES',
            name: 'Fresh Cut Potatoes',
            price: 0.5,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 1,
        },
        {
            id: 'BACON',
            name: 'Bacon',
            price: 0.5,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 2,
        },
        {
            id: 'POTATOES_BACON',
            name: 'Both Potatoes & Bacon',
            price: 0.99,
            priceType: 'addon',
            defaultSelected: false,
            sortOrder: 3,
        },
    ],

    // Sauce and topping options
    SAUCE_OPTIONS: [
        {
            id: 'CHILI_CON_CARNE',
            name: 'Chili con Carne',
            price: 0,
            priceType: 'included',
            defaultSelected: false,
            sortOrder: 1,
        },
        {
            id: 'SOUR_CREAM_SAUCE',
            name: 'Sour Cream Sauce',
            price: 0,
            priceType: 'included',
            defaultSelected: false,
            sortOrder: 2,
        },
        {
            id: 'BURRITO_SAUCE',
            name: 'Special Burrito Sauce',
            price: 0,
            priceType: 'included',
            defaultSelected: true,
            sortOrder: 3,
        },
    ],

    // Removal options
    REMOVAL_OPTIONS: [
        {
            id: 'NO_LETTUCE',
            name: 'No Lettuce',
            price: 0,
            priceType: 'removal',
            defaultSelected: false,
            sortOrder: 1,
        },
        {
            id: 'NO_CHEESE',
            name: 'No Cheese',
            price: 0,
            priceType: 'removal',
            defaultSelected: false,
            sortOrder: 2,
        },
        {
            id: 'NO_TOMATOES',
            name: 'No Tomatoes',
            price: 0,
            priceType: 'removal',
            defaultSelected: false,
            sortOrder: 3,
        },
        {
            id: 'NO_SOUR_CREAM',
            name: 'No Sour Cream',
            price: 0,
            priceType: 'removal',
            defaultSelected: false,
            sortOrder: 4,
        },
        {
            id: 'NO_BEANS',
            name: 'No Beans',
            price: 0,
            priceType: 'removal',
            defaultSelected: false,
            sortOrder: 5,
        },
        {
            id: 'NO_JALAPENOS',
            name: 'No Jalapeños',
            price: 0,
            priceType: 'removal',
            defaultSelected: false,
            sortOrder: 6,
        },
    ],
};

/**
 * Menu Item Modifier Group Assignments
 * Maps menu items to their applicable modifier groups with default selections
 */
const MENU_ITEM_MODIFIERS = {
    // Breakfast items
    1: {
        // breakfast taco
        modifierGroups: [
            'PROTEIN_CHOICES',
            'BASE_TOPPINGS',
            'BREAKFAST_ADDONS',
        ],
        defaultSelections: {
            PROTEIN_CHOICES: ['EGG_SAUSAGE'],
            BASE_TOPPINGS: ['SHREDDED_CHEESE'],
        },
    },
    2: {
        // breakfast burrito
        modifierGroups: [
            'PROTEIN_CHOICES',
            'BASE_TOPPINGS',
            'BREAKFAST_ADDONS',
        ],
        defaultSelections: {
            PROTEIN_CHOICES: ['EGG_SAUSAGE'],
            BASE_TOPPINGS: ['SHREDDED_CHEESE'],
        },
    },
    3: {
        // breakfast bowl
        modifierGroups: [
            'PROTEIN_CHOICES',
            'BASE_TOPPINGS',
            'BREAKFAST_ADDONS',
        ],
        defaultSelections: {
            PROTEIN_CHOICES: ['EGG_SAUSAGE'],
            BASE_TOPPINGS: ['SHREDDED_CHEESE'],
        },
    },
    82: {
        // breakfast quesadilla
        modifierGroups: [
            'PROTEIN_CHOICES',
            'BASE_TOPPINGS',
            'BREAKFAST_ADDONS',
        ],
        defaultSelections: {
            PROTEIN_CHOICES: ['EGG_SAUSAGE'],
            BASE_TOPPINGS: ['SHREDDED_CHEESE'],
        },
    },

    // Taco items - base tacos get basic modifiers, supreme gets premium
    6: {
        // taco
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'SMALL_ADDONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['LETTUCE', 'SHREDDED_CHEESE'],
        },
    },
    7: {
        // supreme taco
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'SMALL_ADDONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['LETTUCE', 'SHREDDED_CHEESE'],
            SMALL_ADDONS: ['TOMATOES', 'SOUR_CREAM'],
        },
    },
    8: {
        // soft taco
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'SMALL_ADDONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['LETTUCE', 'SHREDDED_CHEESE'],
        },
    },
    9: {
        // soft taco supreme
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'SMALL_ADDONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['LETTUCE', 'SHREDDED_CHEESE'],
            SMALL_ADDONS: ['TOMATOES', 'SOUR_CREAM'],
        },
    },
    10: {
        // fajita soft taco
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'LARGE_ADDONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['CHICKEN_FAJITA'],
            BASE_TOPPINGS: ['SHREDDED_CHEESE'],
            LARGE_ADDONS: ['BELL_PEPPERS_ONIONS'],
        },
    },
    11: {
        // taco delite
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'SMALL_ADDONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['LETTUCE', 'SHREDDED_CHEESE', 'HOMEMADE_BEANS'],
        },
    },
    12: {
        // taco delite supreme
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'SMALL_ADDONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['LETTUCE', 'SHREDDED_CHEESE', 'HOMEMADE_BEANS'],
            SMALL_ADDONS: ['TOMATOES', 'SOUR_CREAM'],
        },
    },
    13: {
        // taco delite w/ queso
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'SMALL_ADDONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['LETTUCE', 'SHREDDED_CHEESE', 'HOMEMADE_BEANS'],
            SMALL_ADDONS: ['QUESO'],
        },
    },
    14: {
        // taco delite w/ guac
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'SMALL_ADDONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['LETTUCE', 'SHREDDED_CHEESE', 'HOMEMADE_BEANS'],
            SMALL_ADDONS: ['GUACAMOLE'],
        },
    },

    // Burrito items
    15: {
        // bean burrito
        modifierGroups: ['BASE_TOPPINGS', 'SAUCE_OPTIONS'],
        defaultSelections: {
            BASE_TOPPINGS: ['HOMEMADE_BEANS', 'SHREDDED_CHEESE'],
            SAUCE_OPTIONS: ['BURRITO_SAUCE'],
        },
    },
    16: {
        // meat burrito
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'SAUCE_OPTIONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['SHREDDED_CHEESE'],
            SAUCE_OPTIONS: ['BURRITO_SAUCE'],
        },
    },
    17: {
        // combo burrito
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'SAUCE_OPTIONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['HOMEMADE_BEANS', 'SHREDDED_CHEESE'],
            SAUCE_OPTIONS: ['BURRITO_SAUCE'],
        },
    },
    18: {
        // super burrito
        modifierGroups: [
            'PROTEIN_CHOICES',
            'BASE_TOPPINGS',
            'LARGE_ADDONS',
            'SAUCE_OPTIONS',
        ],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['HOMEMADE_BEANS', 'SHREDDED_CHEESE'],
            LARGE_ADDONS: ['TOMATOES_LG', 'SOUR_CREAM_LG'],
            SAUCE_OPTIONS: ['BURRITO_SAUCE'],
        },
    },
    19: {
        // fajita burrito
        modifierGroups: ['PROTEIN_CHOICES', 'BASE_TOPPINGS', 'LARGE_ADDONS'],
        defaultSelections: {
            PROTEIN_CHOICES: ['CHICKEN_FAJITA'],
            BASE_TOPPINGS: ['SHREDDED_CHEESE'],
            LARGE_ADDONS: ['BELL_PEPPERS_ONIONS'],
        },
    },
    20: {
        // melt burrito
        modifierGroups: [
            'PROTEIN_CHOICES',
            'BASE_TOPPINGS',
            'LARGE_ADDONS',
            'SAUCE_OPTIONS',
        ],
        defaultSelections: {
            PROTEIN_CHOICES: ['GROUND_BEEF'],
            BASE_TOPPINGS: ['HOMEMADE_BEANS', 'SHREDDED_CHEESE'],
            LARGE_ADDONS: ['TOMATOES_LG', 'SOUR_CREAM_LG', 'QUESO_LG'],
            SAUCE_OPTIONS: ['BURRITO_SAUCE'],
        },
    },

    // Continue with other categories...
    // Note: This is a comprehensive example. In practice, you'd continue mapping all menu items.
};

/**
 * Create modifier groups in DynamoDB
 */
async function createModifierGroups() {
    console.log('Creating modifier groups...');

    const groups = MODIFIER_GROUPS.map(group => ({
        pk: `MODIFIER_GROUP#${group.id}`,
        sk: `MODIFIER_GROUP#${group.id}`,
        id: group.id,
        name: group.name,
        description: group.description,
        sortOrder: group.sortOrder,
        required: group.required,
        multiSelect: group.multiSelect,
        min: group.min,
        max: group.max,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    // Batch write modifier groups
    const batches = [];
    for (let i = 0; i < groups.length; i += 25) {
        batches.push(groups.slice(i, i + 25));
    }

    for (const batch of batches) {
        const putRequests = batch.map(item => ({ PutRequest: { Item: item } }));
        await docClient.send(
            new BatchWriteCommand({
                RequestItems: {
                    [TABLE_NAME]: putRequests,
                },
            })
        );
    }

    console.log(`Created ${groups.length} modifier groups`);
}

/**
 * Create modifiers in DynamoDB
 */
async function createModifiers() {
    console.log('Creating modifiers...');

    const modifiers = [];
    for (const [groupId, groupModifiers] of Object.entries(MODIFIERS)) {
        for (const modifier of groupModifiers) {
            modifiers.push({
                pk: `MODIFIER#${groupId}`,
                sk: `MODIFIER#${modifier.id}`,
                id: modifier.id,
                name: modifier.name,
                groupId: groupId,
                groupName:
                    MODIFIER_GROUPS.find(g => g.id === groupId)?.name ||
                    groupId,
                price: modifier.price,
                priceType: modifier.priceType,
                defaultSelected: modifier.defaultSelected,
                sortOrder: modifier.sortOrder,
                active: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
    }

    // Batch write modifiers
    const batches = [];
    for (let i = 0; i < modifiers.length; i += 25) {
        batches.push(modifiers.slice(i, i + 25));
    }

    for (const batch of batches) {
        const putRequests = batch.map(item => ({ PutRequest: { Item: item } }));
        await docClient.send(
            new BatchWriteCommand({
                RequestItems: {
                    [TABLE_NAME]: putRequests,
                },
            })
        );
    }

    console.log(`Created ${modifiers.length} modifiers`);
}

/**
 * Update menu items with modifier groups
 */
async function updateMenuItemsWithModifiers() {
    console.log('Updating menu items with modifier groups...');

    const updates = [];
    for (const [itemId, config] of Object.entries(MENU_ITEM_MODIFIERS)) {
        const modifierGroups = config.modifierGroups.map(groupId => {
            const group = MODIFIER_GROUPS.find(g => g.id === groupId);
            const defaultSelections = config.defaultSelections[groupId] || [];

            return {
                groupId: groupId,
                groupName: group.name,
                required: group.required,
                multiSelect: group.multiSelect,
                min: group.min,
                max: group.max,
                defaultSelections: defaultSelections,
            };
        });

        updates.push({
            pk: `ITEM#${itemId}`,
            sk: `ITEM#${itemId}`,
            modifierGroups: modifierGroups,
            updatedAt: new Date().toISOString(),
        });
    }

    // Batch write menu item updates
    const batches = [];
    for (let i = 0; i < updates.length; i += 25) {
        batches.push(updates.slice(i, i + 25));
    }

    for (const batch of batches) {
        const putRequests = batch.map(item => ({ PutRequest: { Item: item } }));
        await docClient.send(
            new BatchWriteCommand({
                RequestItems: {
                    [TABLE_NAME]: putRequests,
                },
            })
        );
    }

    console.log(`Updated ${updates.length} menu items with modifier groups`);
}

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('Starting modifier system seeding...');
        console.log(`Using table: ${TABLE_NAME}`);

        await createModifierGroups();
        await createModifiers();
        await updateMenuItemsWithModifiers();

        console.log('Modifier system seeding completed successfully!');

        // Print summary
        console.log('\n=== SEEDING SUMMARY ===');
        console.log(`Modifier Groups: ${MODIFIER_GROUPS.length}`);
        console.log(
            `Total Modifiers: ${Object.values(MODIFIERS).flat().length}`
        );
        console.log(
            `Menu Items Updated: ${Object.keys(MENU_ITEM_MODIFIERS).length}`
        );

        console.log('\n=== MODIFIER GROUPS CREATED ===');
        MODIFIER_GROUPS.forEach(group => {
            console.log(
                `- ${group.id}: ${group.name} (${MODIFIERS[group.id]?.length || 0} modifiers)`
            );
        });
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    MODIFIER_GROUPS,
    MODIFIERS,
    MENU_ITEM_MODIFIERS,
    createModifierGroups,
    createModifiers,
    updateMenuItemsWithModifiers,
};
