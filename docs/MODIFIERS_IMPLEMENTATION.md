# Modifier Groups Implementation Guide

## Overview

A simplified modifier system supports add-ons for menu items. Modifier groups are derived from menu item category. Each modifier has two prices (sm/lg) for portion-based pricing. Family items use quantity-based pricing (unitCount × priceSm).

## Schema Summary

### Modifier Groups (3 total)

- **LUNCH** – Lunch items (tacos, burritos, salads, etc.)
- **BREAKFAST** – Breakfast items
- **FAMILY** – Family packs (10 pack, dozen, etc.)

### Modifiers

Each modifier has `priceSm`, `priceLg`, and `priceType`:

```json
{
    "id": "TOMATOES",
    "name": "Tomatoes",
    "priceSm": 0.5,
    "priceLg": 0.75,
    "priceType": "addon",
    "groupId": "LUNCH"
}
```

**Price Types:**

- **addon** – Extra charge; uses priceSm/priceLg. Price fields are editable in admin.
- **included** – No charge (e.g., lettuce, cheese). Prices forced to 0; fields disabled in admin.
- **removal** – Removal option (e.g., "No Lettuce"). Prices forced to 0; fields disabled in admin.

The backend enforces that `included` and `removal` modifiers always store priceSm and priceLg as 0.

### Menu Items

- **portionSize**: `"sm"` or `"lg"` for Breakfast/Lunch items (determines which modifier price to use)
- **unitCount**: For Family items (e.g., 10 for "10 pack"); modifier price = unitCount × priceSm
- **categoryId** determines modifier group:
    - 1 → BREAKFAST
    - 12 → FAMILY
    - 13, 14 → No modifiers (Desserts, Drinks)
    - 2–11 → LUNCH

## Lambda Functions

### Modifier Groups APIs

- `getModifierGroups` – GET `/modifier-groups`
- `createModifierGroup` – POST `/modifier-groups`
- `updateModifierGroup` – PUT `/modifier-groups/{id}`
- `deleteModifierGroup` – DELETE `/modifier-groups/{id}`

### Modifiers APIs

- `getModifiers` – GET `/modifiers?groupId={groupId}` (optional filter)
- `createModifier` – POST `/modifiers` (body: priceSm, priceLg)
- `updateModifier` – PUT `/modifiers/{id}` (body: priceSm, priceLg, groupId)
- `deleteModifier` – DELETE `/modifiers/{id}?groupId={groupId}`

### Menu Item Lambdas

- `createMenuItem` – Supports `portionSize`, `unitCount`
- `updateMenuItem` – Supports `portionSize`, `unitCount`

## Admin Pages

- **ModifierEdit** – Two price fields (Small, Large)
- **Modifiers** – Create/edit modifiers; filter by LUNCH/BREAKFAST/FAMILY
- **MenuItemEdit / MenuItemNew** – Portion Size dropdown (sm/lg) or Unit Count input based on category

## Seed Script

Run `node data/seed-modifiers.js` for a clean migration:

1. Deletes old modifier groups and modifiers
2. Creates LUNCH, BREAKFAST, FAMILY groups
3. Creates modifiers with priceSm/priceLg
4. Updates menu items with portionSize/unitCount, removes modifierGroups

## Data Flow

1. Menu item has `categoryId` and `portionSize` or `unitCount`
2. Modifier group is derived from categoryId
3. For LUNCH/BREAKFAST: use `priceSm` or `priceLg` based on portionSize
4. For FAMILY: use `unitCount × priceSm` per modifier
