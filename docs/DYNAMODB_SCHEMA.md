# DynamoDB Schema for Taco Delite App

This document describes the DynamoDB table structure and data models for the Taco Delite application.

## 🗄️ **Table Structure**

### **1. Menu Items Table** (`tacodelite-app-menu-items-staging`)

**Primary Key Structure:**

- **PK (Partition Key):** `ITEM#{categoryId}` (e.g., `ITEM#1`, `ITEM#2`)
- **SK (Sort Key):** `ITEM#{itemId}` (e.g., `ITEM#1`, `ITEM#2`)

**Attributes:**

```json
{
    "pk": "ITEM#1",
    "sk": "ITEM#1",
    "id": 1,
    "name": "breakfast taco",
    "price": 3.5,
    "active": true,
    "vegetarian": false,
    "description": "A soft 6in tortilla, your choice of filling (egg and sausage or chorizo), and shredded cheese add fresh cut potatoes or bacon for $0.50 or both for $0.99",
    "categoryId": 1,
    "categoryName": "Breakfast",
    "alt": null,
    "img": null,
    "createdAt": "2024-01-15T12:00:00Z"
}
```

### **2. Categories Table** (`tacodelite-app-categories-staging`)

**Primary Key Structure:**

- **PK (Partition Key):** `CATEGORY#{categoryId}` (e.g., `CATEGORY#1`, `CATEGORY#2`)

**Attributes:**

```json
{
    "pk": "CATEGORY#1",
    "name": "Breakfast",
    "description": "Breakfast items including tacos, burritos, and bowls",
    "sortOrder": 1,
    "active": true,
    "createdAt": "2024-01-15T12:00:00Z"
}
```

### **3. Users Table** (`tacodelite-app-users-staging`)

**Primary Key Structure:**

- **PK (Partition Key):** `USER#{userId}` (e.g., `USER#001`, `USER#002`)

**Attributes:**

```json
{
    "pk": "USER#001",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "555-1234",
    "address": "123 Main St, Plano, TX",
    "preferences": {
        "spiceLevel": 2,
        "vegetarian": false,
        "allergies": ["shellfish"]
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "lastOrder": "2024-01-15T12:00:00Z"
}
```

### **4. Announcements Table** (`tacodelite-app-staging`)

**Primary Key Structure:**

- **PK (Partition Key):** `ANNOUNCEMENT`
- **SK (Sort Key):** `ANNOUNCEMENT#{announcementId}` (e.g., `ANNOUNCEMENT#ANN1234567890`)

**Attributes:**

```json
{
    "pk": "ANNOUNCEMENT",
    "sk": "ANNOUNCEMENT#ANN1234567890",
    "id": "ANN1234567890",
    "title": "Holiday Hours",
    "message": "We will be closed on Christmas Day",
    "type": "hours",
    "active": true,
    "startsAt": "2024-12-20",
    "expiresAt": "2024-12-26",
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z",
    "createdBy": "admin@tacodelite.com"
}
```

**Announcement Types:**

- `general` - General announcements
- `holiday` - Holiday-related announcements
- `hours` - Hours/special time announcements
- `discount` - Discount or promotional announcements
- `event` - Event announcements

**Scheduled Announcements:**

- `startsAt` (optional): Date when announcement should start showing (YYYY-MM-DD format)
- `expiresAt` (optional): Date when announcement should stop showing (YYYY-MM-DD format)
- If `startsAt` is null, announcement shows immediately when active
- If `expiresAt` is null, announcement never expires
- Announcements only display when current date is between `startsAt` (inclusive) and `expiresAt` (inclusive)

### **5. Modifier Groups Table** (`tacodelite-app-staging`)

**Primary Key Structure:**

- **PK (Partition Key):** `MODIFIER_GROUP#{groupId}` (e.g., `MODIFIER_GROUP#LUNCH`)
- **SK (Sort Key):** `MODIFIER_GROUP#{groupId}`

**Attributes:**

```json
{
    "pk": "MODIFIER_GROUP#LUNCH",
    "sk": "MODIFIER_GROUP#LUNCH",
    "id": "LUNCH",
    "name": "Lunch",
    "description": "Add-ons for lunch items",
    "sortOrder": 1,
    "active": true,
    "createdAt": "2025-01-15T12:00:00Z",
    "updatedAt": "2025-01-15T12:00:00Z"
}
```

**Modifier Groups (3 total):**

- `LUNCH` - Lunch items (tacos, burritos, salads, etc.); uses portionSize (sm/lg) for pricing
- `BREAKFAST` - Breakfast items; uses portionSize (sm/lg) for pricing
- `FAMILY` - Family packs (10 pack, dozen, etc.); uses unitCount × priceSm for pricing

**Category → Modifier Group Mapping:**

- categoryId 1 → BREAKFAST
- categoryId 12 → FAMILY
- categoryId 13, 14 → No modifiers (Desserts, Drinks)
- categoryId 2–11 → LUNCH

### **6. Modifiers Table** (`tacodelite-app-staging`)

**Primary Key Structure:**

- **PK (Partition Key):** `MODIFIER#{groupId}` (e.g., `MODIFIER#LUNCH`)
- **SK (Sort Key):** `MODIFIER#{modifierId}` (e.g., `MODIFIER#TOMATOES`)

**Attributes:**

```json
{
    "pk": "MODIFIER#LUNCH",
    "sk": "MODIFIER#TOMATOES",
    "id": "TOMATOES",
    "name": "Tomatoes",
    "groupId": "LUNCH",
    "groupName": "Lunch",
    "priceSm": 0.5,
    "priceLg": 0.75,
    "priceType": "addon",
    "defaultSelected": false,
    "sortOrder": 1,
    "active": true,
    "createdAt": "2025-01-15T12:00:00Z",
    "updatedAt": "2025-01-15T12:00:00Z"
}
```

**Price Types:**

- `addon` - Extra charge; uses priceSm or priceLg based on menu item portionSize (or unitCount × priceSm for Family)
- `included` - No charge; priceSm and priceLg are 0
- `removal` - Removal option; priceSm and priceLg are 0

**Menu Item with portionSize/unitCount:**

```json
{
    "pk": "ITEM#1",
    "sk": "ITEM#1",
    "id": 1,
    "name": "Taco",
    "price": 3.5,
    "portionSize": "sm",
    "categoryId": 2,
    "active": true
}
```

**Family Item Example:**

```json
{
    "pk": "ITEM#61",
    "sk": "ITEM#61",
    "id": 61,
    "name": "10 pack of tacos",
    "price": 18.99,
    "unitCount": 10,
    "categoryId": 12,
    "active": true
}
```

## 🔍 **Query Patterns**

### **Get All Menu Items by Category:**

```javascript
// Query all items in category 1
const params = {
    TableName: 'tacodelite-app-menu-items-staging',
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
        ':pk': 'ITEM#1',
    },
};
```

### **Get Menu Item by ID:**

```javascript
// Get specific item
const params = {
    TableName: 'tacodelite-app-menu-items-staging',
    Key: {
        pk: 'ITEM#1',
        sk: 'ITEM#1',
    },
};
```

### **Get All Categories:**

```javascript
// Scan categories table (small table, efficient)
const params = {
    TableName: 'tacodelite-app-categories-staging',
};
```

### **Get Active Menu Items:**

```javascript
// Get all active items in a category
const params = {
    TableName: 'tacodelite-app-menu-items-staging',
    KeyConditionExpression: 'pk = :pk',
    FilterExpression: 'active = :active',
    ExpressionAttributeValues: {
        ':pk': 'ITEM#1',
        ':active': true,
    },
};
```

### **Get Active Announcements:**

```javascript
// Get all active announcements
const params = {
    TableName: 'tacodelite-app-staging',
    FilterExpression:
        'begins_with(pk, :announcementPrefix) AND active = :active',
    ExpressionAttributeValues: {
        ':announcementPrefix': 'ANNOUNCEMENT',
        ':active': true,
    },
};

// Note: The Lambda function further filters announcements based on startsAt and expiresAt
// to only return announcements within their scheduled window
```

### **Get All Modifier Groups:**

```javascript
// Scan for all modifier groups
const params = {
    TableName: 'tacodelite-app-staging',
    FilterExpression: 'begins_with(pk, :groupPrefix)',
    ExpressionAttributeValues: {
        ':groupPrefix': 'MODIFIER_GROUP#',
    },
};
```

### **Get Modifier Group by ID:**

```javascript
// Get specific modifier group
const params = {
    TableName: 'tacodelite-app-staging',
    Key: {
        pk: 'MODIFIER_GROUP#SMALL_ADDONS',
        sk: 'MODIFIER_GROUP#SMALL_ADDONS',
    },
};
```

### **Get All Modifiers in a Group:**

```javascript
// Query all modifiers in a specific group
const params = {
    TableName: 'tacodelite-app-staging',
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
        ':pk': 'MODIFIER#SMALL_ADDONS',
    },
};
```

### **Get Modifier by ID:**

```javascript
// Get specific modifier
const params = {
    TableName: 'tacodelite-app-staging',
    Key: {
        pk: 'MODIFIER#SMALL_ADDONS',
        sk: 'MODIFIER#LETTUCE_SM',
    },
};
```

## 🚀 **Data Seeding**

The seeding script processes the CSV file with nested JSON structure:

```csv
id,name,food_items
1,Breakfast,"[{""id"":1,""name"":""breakfast taco"",""price"":""3.50"",""active"":true,""categoryId"":1,""vegetarian"":false,""description"":""...""}]"
```

**Features:**

- **Automatic JSON parsing** of nested food_items arrays
- **Batch processing** (25 items per batch for DynamoDB limits)
- **Progress tracking** with category-by-category feedback
- **Error handling** for malformed JSON
- **Rich data structure** including alt text, images, and metadata

## 🎯 **Key Benefits**

### **1. Efficient Queries:**

- **Partition Key:** `ITEM#{categoryId}` groups all items by category
- **Sort Key:** `ITEM#{itemId}` provides unique identification
- **Fast Retrieval:** Single query gets all items in a category

### **2. Flexible Schema:**

- **Optional Fields:** `alt`, `img` can be null
- **Rich Metadata:** Includes category names for easy display
- **Extensible:** Easy to add new fields like `ingredients`, `allergens`

### **3. Cost Optimization:**

- **Pay-per-request** billing
- **Efficient storage** with proper key design
- **Minimal read/write** operations

## 🛠️ **Next Steps**

1. **Deploy Tables:** `terraform apply -var-file=staging.tfvars`
2. **Seed Data:** `npm run seed:db`
3. **Verify Data:** Check AWS DynamoDB console
4. **Create Lambda Functions:** For CRUD operations
5. **Update React App:** To fetch from DynamoDB

## 💡 **Best Practices**

- **Use Batch Operations:** Process items in groups of 25
- **Monitor Costs:** Set up CloudWatch alarms
- **Backup Data:** Regular exports for data safety
- **Test Queries:** Verify performance with real data volumes
