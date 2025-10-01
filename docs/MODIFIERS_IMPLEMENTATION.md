# Modifier Groups Implementation Guide

## Overview

A complete modifier groups system has been implemented to support adding customizations to menu items (e.g., small/large add-ons, drink sizes, premium proteins). This system follows industry-standard POS patterns and is designed to scale for future ordering functionality.

## What Was Built

### 1. **Database Schema** (Updated in `DYNAMODB_SCHEMA.md`)

#### Modifier Groups
- **Purpose**: Define types/categories of modifiers (e.g., "Small Portion Add-ons", "Large Portion Add-ons", "Drink Sizes")
- **Structure**:
  ```json
  {
    "pk": "MODIFIER_GROUP#SMALL_ADDONS",
    "sk": "MODIFIER_GROUP#SMALL_ADDONS",
    "id": "SMALL_ADDONS",
    "name": "Small Portion Add-ons",
    "description": "For tacos and smaller items",
    "sortOrder": 1,
    "active": true
  }
  ```

#### Modifiers
- **Purpose**: Individual add-ons/customizations within a group
- **Structure**:
  ```json
  {
    "pk": "MODIFIER#SMALL_ADDONS",
    "sk": "MODIFIER#LETTUCE_SM",
    "id": "LETTUCE_SM",
    "name": "Lettuce",
    "groupId": "SMALL_ADDONS",
    "groupName": "Small Portion Add-ons",
    "price": 0.50,
    "sortOrder": 1,
    "active": true
  }
  ```

#### Menu Items with Modifier Groups
```json
{
  "id": 1,
  "name": "Taco",
  "price": 3.50,
  "modifierGroups": [
    {
      "groupId": "SMALL_ADDONS",
      "groupName": "Small Portion Add-ons",
      "required": false,
      "multiSelect": true,
      "min": 0,
      "max": null
    }
  ]
}
```

### 2. **Lambda Functions** (8 New Functions)

#### Modifier Groups APIs
- **`getModifierGroups`** - GET `/modifier-groups`
- **`createModifierGroup`** - POST `/modifier-groups`
- **`updateModifierGroup`** - PUT `/modifier-groups/{id}`
- **`deleteModifierGroup`** - DELETE `/modifier-groups/{id}`

#### Modifiers APIs
- **`getModifiers`** - GET `/modifiers?groupId={groupId}` (optional filter)
- **`createModifier`** - POST `/modifiers`
- **`updateModifier`** - PUT `/modifiers/{id}`
- **`deleteModifier`** - DELETE `/modifiers/{id}?groupId={groupId}`

#### Updated Menu Item Lambdas
- **`createMenuItem`** - Now supports `modifierGroups` array
- **`updateMenuItem`** - Now supports `modifierGroups` array

### 3. **Admin Pages** (tacodelite-admin)

#### New Pages Created
1. **`/modifier-groups`** - Manage modifier groups
   - Create/Edit/Delete modifier groups
   - Set sort order and active status
   - View all groups in a table

2. **`/modifiers`** - Manage individual modifiers
   - Create/Edit/Delete modifiers
   - Assign to modifier groups
   - Set prices and sort order
   - Filter by group

#### Updated Pages
1. **`/menu-items/new`** - Added modifier group selection
   - Checkbox list of available modifier groups
   - Auto-populates with default settings (optional, multi-select)

2. **`/menu-items/:id/edit`** - Added modifier group selection
   - Shows currently assigned groups
   - Allow adding/removing groups

### 4. **API Service Updates** (tacodelite-admin)

Added functions in `/src/services/apiService.js`:
- `getModifierGroups()`
- `createModifierGroup(groupData)`
- `updateModifierGroup(groupId, groupData)`
- `deleteModifierGroup(groupId)`
- `getModifiers(groupId?)` 
- `createModifier(modifierData)`
- `updateModifier(modifierId, modifierData)`
- `deleteModifier(modifierId, groupId)`

### 5. **Routing** (tacodelite-admin)

Updated `App.jsx` to include:
```jsx
<Route path="/modifier-groups" element={<ProtectedRoute><ModifierGroups /></ProtectedRoute>} />
<Route path="/modifiers" element={<ProtectedRoute><Modifiers /></ProtectedRoute>} />
```

## Next Steps to Deploy

### 1. **Deploy Lambda Functions**

You'll need to deploy the 8 new Lambda functions to AWS:

```bash
cd /Users/jorgeperez/Development/tacodelite-app

# Deploy Modifier Groups Lambdas
./scripts/deploy-lambda.sh getModifierGroups
./scripts/deploy-lambda.sh createModifierGroup
./scripts/deploy-lambda.sh updateModifierGroup
./scripts/deploy-lambda.sh deleteModifierGroup

# Deploy Modifiers Lambdas
./scripts/deploy-lambda.sh getModifiers
./scripts/deploy-lambda.sh createModifier
./scripts/deploy-lambda.sh updateModifier
./scripts/deploy-lambda.sh deleteModifier
```

### 2. **Update API Gateway**

Add the following routes to your API Gateway:

**Modifier Groups:**
- `GET /modifier-groups` → `getModifierGroups`
- `POST /modifier-groups` → `createModifierGroup`
- `PUT /modifier-groups/{id}` → `updateModifierGroup`
- `DELETE /modifier-groups/{id}` → `deleteModifierGroup`

**Modifiers:**
- `GET /modifiers` → `getModifiers` (supports `?groupId=` query param)
- `POST /modifiers` → `createModifier`
- `PUT /modifiers/{id}` → `updateModifier`
- `DELETE /modifiers/{id}` → `deleteModifier` (requires `?groupId=` query param)

### 3. **Update Terraform (Optional but Recommended)**

Add Lambda function definitions in your Terraform configuration for the new functions. This ensures infrastructure as code best practices.

### 4. **Create Initial Modifier Groups**

Once deployed, use the admin panel to create your modifier groups:

**Suggested Initial Groups:**
1. **Small Portion Add-ons** (SMALL_ADDONS)
   - For: Tacos
   - Examples: Lettuce (sm), Tomatoes (sm), Onions (sm), Cheese (sm)

2. **Large Portion Add-ons** (LARGE_ADDONS)
   - For: Burritos, Salads, Nachos, Plates
   - Examples: Lettuce (lg), Tomatoes (lg), Guacamole, Sour Cream

3. **Drink Sizes** (DRINK_SIZES)
   - For: Beverages
   - Examples: Small, Medium, Large

4. **Premium Proteins** (PREMIUM_PROTEINS)
   - For: All items
   - Examples: Grilled Chicken (+$2), Steak (+$3), Shrimp (+$4)

5. **Sauces** (SAUCES)
   - For: All items
   - Examples: Mild Salsa, Hot Salsa, Verde, Habanero

### 5. **Deploy Admin Panel**

Deploy the updated admin panel:

```bash
cd /Users/jorgeperez/Development/tacodelite-admin
npm run build
./upload-admin.sh
```

## Usage Guide

### For Admins

1. **Navigate to Modifier Groups** (`/modifier-groups`)
   - Click "New Group"
   - Enter ID (e.g., "SMALL_ADDONS"), Name, Description
   - Set sort order
   - Click "Create"

2. **Navigate to Modifiers** (`/modifiers`)
   - Click "New Modifier"
   - Enter ID (e.g., "LETTUCE_SM"), Name, Price
   - Select the modifier group
   - Click "Create"

3. **Assign to Menu Items** (`/menu-items`)
   - Edit any menu item
   - Scroll to "Modifier Groups" section
   - Check the groups that apply to this item
   - Save changes

### Data Flow

1. User creates **Modifier Groups** (e.g., "Small Add-ons")
2. User creates **Modifiers** within groups (e.g., "Lettuce" in "Small Add-ons" for $0.50)
3. User assigns **Modifier Groups** to menu items (e.g., Tacos get "Small Add-ons")
4. When customers order (future feature), they can select modifiers from assigned groups

## Design Decisions

### Why "Modifier Groups" vs Single Modifiers?

This approach allows:
- **Reusability**: Same modifier (lettuce) in different contexts (small vs large portions) with different prices
- **Flexibility**: Easy to manage which groups apply to which items
- **Scalability**: Future features like "required" groups, min/max selections
- **Industry Standard**: Matches how Square, Toast, and other POS systems work

### Pricing Strategy

- **Base Item Price** + **Modifier Prices** = Total
- Each modifier has its own price
- Same ingredient (e.g., lettuce) can have different prices in different groups

### Future Enhancements

The current schema supports (but doesn't yet use):
- `required`: Make modifier selection mandatory
- `multiSelect`: Allow multiple selections from a group
- `min/max`: Set selection limits (e.g., "Choose 2-4 toppings")

These can be implemented in the ordering UI when you're ready to add ordering functionality.

## Files Created/Modified

### Created Files (Lambda)
- `/lambda/getModifierGroups/index.js`
- `/lambda/createModifierGroup/index.js`
- `/lambda/updateModifierGroup/index.js`
- `/lambda/deleteModifierGroup/index.js`
- `/lambda/getModifiers/index.js`
- `/lambda/createModifier/index.js`
- `/lambda/updateModifier/index.js`
- `/lambda/deleteModifier/index.js`

### Created Files (Admin)
- `/tacodelite-admin/src/pages/ModifierGroups.jsx`
- `/tacodelite-admin/src/pages/Modifiers.jsx`

### Modified Files (Lambda)
- `/lambda/createMenuItem/index.js` - Added modifierGroups support
- `/lambda/updateMenuItem/index.js` - Added modifierGroups support

### Modified Files (Admin)
- `/tacodelite-admin/src/App.jsx` - Added routes
- `/tacodelite-admin/src/services/apiService.js` - Added API functions
- `/tacodelite-admin/src/pages/MenuItemEdit.jsx` - Added modifier group UI
- `/tacodelite-admin/src/pages/MenuItemNew.jsx` - Added modifier group UI

### Modified Files (Documentation)
- `/docs/DYNAMODB_SCHEMA.md` - Added modifier groups and modifiers schema
- `/docs/MODIFIERS_IMPLEMENTATION.md` - This file

## Questions?

If you have any questions about the implementation or need help with deployment, feel free to ask!

