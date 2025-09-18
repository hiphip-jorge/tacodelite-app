# Data Directory

This directory contains data files and seeding scripts for the Taco Delite application.

## Files

- `menu_categories_rows.csv` - Menu categories data for seeding
- `menu_rows.csv` - Menu items data for seeding  
- `seed-dynamodb.js` - Main seeding script for DynamoDB
- `seed-admin-users.cjs` - Admin user seeding script
- `seed-admin-users-dev.cjs` - Development admin user seeding script
- `SEEDING_README.md` - Documentation for seeding process

## Usage

```bash
# Seed the database with menu data
npm run seed:db

# Seed admin users (run manually as needed)
node data/seed-admin-users.cjs
```
