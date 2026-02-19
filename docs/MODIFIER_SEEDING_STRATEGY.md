# Modifier Seeding Strategy (Redesigned)

## Overview

The modifier system uses 3 groups (LUNCH, BREAKFAST, FAMILY) with modifiers that have `priceSm` and `priceLg`. Menu items use `portionSize` or `unitCount` for pricing. Modifier group is derived from categoryId.

## Modifier Groups

### LUNCH

- Proteins, base toppings, add-ons (tomatoes, sour cream, guac, queso, etc.), sauce options, removal options
- Used for categories 2–11 (Tacos, Burritos, Nachos, Salads, etc.)

### BREAKFAST

- Egg proteins, base toppings, breakfast add-ons (potatoes, bacon, both), removal options
- Used for category 1

### FAMILY

- Same modifiers as LUNCH
- Used for category 12; pricing = unitCount × priceSm

## Portion Size Mapping

**Standard items (portionSize):**

- **sm**: Tacos, tostadas, breakfast taco, sides, extras
- **lg**: Burritos, bowls, salads, nachos, quesadillas, plates, breakfast burrito/bowl/quesadilla

**Family items (unitCount):**

- "10 pack of tacos" → 10
- "dozen tamales" → 12
- Gallon of tea, bag of ice → 1

## Running the Seed

```bash
cd tacodelite-app
DYNAMODB_TABLE=tacodelite-app-menu-items-staging node data/seed-modifiers.js
```

The script performs a clean migration: deletes old modifiers, creates new structure, updates menu items.
