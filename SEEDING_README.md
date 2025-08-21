# Seeding DynamoDB Tables

This guide explains how to seed your DynamoDB tables with Taco Delite menu data.

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Deploy Infrastructure**
```bash
# Deploy DynamoDB tables
terraform apply -var-file=staging.tfvars
```

### **3. Set Environment Variables**
```bash
# Get table names from Terraform output
export MENU_ITEMS_TABLE=$(terraform output -raw dynamodb_menu_items_table)
export CATEGORIES_TABLE=$(terraform output -raw dynamodb_categories_table)

# Or set manually
export MENU_ITEMS_TABLE=tacodelite-app-menu-items-staging
export CATEGORIES_TABLE=tacodelite-app-categories-staging
```

### **4. Run the Seeding Script**
```bash
npm run seed:db
```

## 📊 **What Gets Created**

### **Categories Table:**
- 14 predefined categories (Breakfast, Tacos, Burritos, etc.)
- Each category has name, description, and sort order

### **Menu Items Table:**
- **82 menu items** from your CSV file
- Organized by category with proper DynamoDB keys
- Includes price, vegetarian status, descriptions, and metadata

## 🔧 **Data Structure**

### **Categories:**
```
pk: CATEGORY#1
name: "Breakfast"
description: "Breakfast items including tacos, burritos, and bowls"
sortOrder: 1
active: true
```

### **Menu Items:**
```
pk: ITEM#1          (category ID)
sk: ITEM#1           (item ID)
id: 1
name: "breakfast taco"
price: 3.50
vegetarian: false
description: "A soft 6in tortilla, your choice of filling..."
categoryId: 1
categoryName: "Breakfast"
alt: null
img: null
```

## 📁 **CSV File Structure**

The seeding script expects a CSV file with this structure:

```csv
id,name,food_items
1,Breakfast,"[{""id"":1,""name"":""breakfast taco"",""price"":""3.50"",""active"":true,""categoryId"":1,""vegetarian"":false,""description"":""...""}]"
2,Tacos,"[{""id"":6,""name"":""taco"",""price"":""2.39"",""active"":true,""categoryId"":2,""vegetarian"":false,""description"":""...""}]"
```

**Key Features:**
- **Nested JSON:** Each row contains a JSON array of food items
- **Rich Metadata:** Includes alt text, images, and detailed descriptions
- **Category Grouping:** Items are automatically grouped by category

## 🛠️ **Customization**

### **Modify Categories:**
Edit the `categories` array in `seed-dynamodb.js` to add/remove categories.

### **Modify Data Transformation:**
Update the `seedMenuItems()` function to change how JSON data is processed.

### **Add New Fields:**
Extend the item structure to include additional fields like:
- `ingredients` - List of ingredients
- `allergens` - Allergy information
- `spiceLevel` - Spice rating
- `prepTime` - Preparation time

## 🚨 **Troubleshooting**

### **CSV File Not Found:**
Ensure `td-app/mocks/menu_categories_rows.csv` exists in the correct path.

### **JSON Parse Errors:**
The script handles escaped quotes (`""`) automatically. If you have other JSON issues, check the CSV format.

### **Permission Errors:**
Make sure your AWS credentials are configured:
```bash
aws configure
```

### **Table Not Found:**
Verify table names match your Terraform output:
```bash
terraform output
```

## 📈 **Next Steps**

After seeding:
1. **Verify data** in AWS DynamoDB console
2. **Create Lambda functions** for CRUD operations
3. **Update React app** to fetch from DynamoDB
4. **Test menu display** with real data

## 💡 **Tips**

- **Backup data** before running seeding scripts
- **Test with small datasets** first
- **Monitor DynamoDB costs** during development
- **Use environment variables** for different environments
- **Check AWS CloudWatch** for any errors during seeding

## 🔍 **Data Verification**

After seeding, verify your data:

```bash
# Check table contents
aws dynamodb scan --table-name tacodelite-app-menu-items-staging --limit 5
aws dynamodb scan --table-name tacodelite-app-categories-staging --limit 5

# Count items
aws dynamodb scan --table-name tacodelite-app-menu-items-staging --select COUNT
aws dynamodb scan --table-name tacodelite-app-categories-staging --select COUNT
```

**Expected Results:**
- **Categories:** 14 items
- **Menu Items:** 82 items
- **Active Items:** Most items should be active=true
