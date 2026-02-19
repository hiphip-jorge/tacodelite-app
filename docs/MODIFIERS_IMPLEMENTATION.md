# Modifier Groups Implementation Guide

## Overview

A simplified modifier system supports add-ons for menu items. Modifier groups are derived from menu item category. Each modifier has two prices (sm/lg) for portion-based pricing. Family items use quantity-based pricing (unitCount × priceSm).

## Schema Summary

### Modifier Groups (3 total)

- **LUNCH** – Lunch items (tacos, burritos, salads, etc.)
- **BREAKFAST** – Breakfast items
- **FAMILY** – Family packs (10 pack, dozen, etc.)

### Modifiers

Each modifier has `priceSm` and `priceLg`:

```json
{
    "id": "TOMATOES",
    "name": "Tomatoes",
    "priceSm": 0.5,
    "priceLg": 0.75,
    "groupId": "LUNCH"
}
```

**Behavior is determined by menu item association:**

- **Included** – When in a menu item's `defaultSelections`, no charge (price not added).
- **Add-on** – When in a menu item's `availableAddons`, charge `priceSm` or `priceLg` based on portion.
- **Removal** – Every modifier can be removed. When a modifier is included, the customer automatically gets a "No X" option (derived in the UI, not stored).

### Menu Items

- **portionSize**: `"sm"` or `"lg"` for Breakfast/Lunch items (determines which modifier price to use)
- **unitCount**: For Family items (e.g., 10 for "10 pack"); modifier price = unitCount × priceSm
- **modifierGroupId**: Explicit association to modifier group (LUNCH, BREAKFAST, FAMILY); set by seed script
- **defaultSelections**: Array of modifier IDs that come with the item (included toppings)
- **availableAddons**: Array of modifier IDs that customers can add (addon-type modifiers)
- **categoryId** determines modifier group:
    - 1 → BREAKFAST
    - 12 → FAMILY
    - 13, 14 → No modifiers (Desserts, Drinks)
    - 2–11 → LUNCH

**Removal options** (e.g., "No Lettuce") are derived from included modifiers: when an item has LETTUCE in defaultSelections, the "No Lettuce" removal option is automatically available. No separate configuration needed.

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

- `createMenuItem` – Supports `portionSize`, `unitCount`, `modifierGroupId`, `defaultSelections`, `availableAddons`
- `updateMenuItem` – Supports `portionSize`, `unitCount`, `modifierGroupId`, `defaultSelections`, `availableAddons`

## Admin Pages

- **ModifierEdit** – Two price fields (Small, Large)
- **Modifiers** – Create/edit modifiers; filter by LUNCH/BREAKFAST/FAMILY
- **MenuItemEdit / MenuItemNew** – Portion Size dropdown (sm/lg) or Unit Count input; modifier config: checkboxes for included options and available add-ons (removal derived from included)

## Seed Script

Run `node data/seed-modifiers.js` for a clean migration:

1. Deletes old modifier groups and modifiers
2. Creates LUNCH, BREAKFAST, FAMILY groups
3. Creates modifiers with priceSm/priceLg
4. Updates menu items with portionSize, unitCount, modifierGroupId, defaultSelections

## Data Flow

1. Menu item has `categoryId`, `portionSize` or `unitCount`, `modifierGroupId`, `defaultSelections`, `availableAddons`
2. Modifier group is derived from categoryId (and stored as modifierGroupId)
3. For LUNCH/BREAKFAST: use `priceSm` or `priceLg` based on portionSize
4. For FAMILY: use `unitCount × priceSm` per modifier
