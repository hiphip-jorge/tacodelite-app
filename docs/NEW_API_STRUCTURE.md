# New Parameterized API Structure

## Overview

This document outlines the proposed new API structure that organizes all menu-related endpoints under a unified `/menu` namespace with parameterized paths for better organization and extensibility.

## Current Structure

```
/prod/menu-items          # GET, POST
/prod/menu-items/{id}     # PUT, DELETE
/prod/categories          # GET, POST
/prod/categories/{id}     # PUT, DELETE
/prod/search              # GET
/prod/menu-items-by-category  # GET
/prod/modifier-groups     # GET, POST, PUT, DELETE
/prod/modifiers           # GET, POST, PUT, DELETE
```

## Proposed New Structure

### Core Menu Endpoints

```
/prod/menu/menu-items               # GET, POST - All menu items
/prod/menu/menu-items/{id}          # GET, PUT, DELETE - Individual item
/prod/menu/menu-items/items         # GET - Items only (no modifiers)
/prod/menu/menu-items/modifiers     # GET - Modifiers only
/prod/menu/menu-items/items/by-category/{id}  # GET - Items by category
/prod/menu/menu-items/items/search?query=...  # GET - Search items
```

### Category Endpoints

```
/prod/menu/categories               # GET, POST - All categories
/prod/menu/categories/{id}          # GET, PUT, DELETE - Individual category
```

### Modifier Endpoints

```
/prod/menu/modifier-groups          # GET, POST, PUT, DELETE
/prod/menu/modifier-groups/{id}     # GET, PUT, DELETE
/prod/menu/modifiers                # GET, POST, PUT, DELETE
/prod/menu/modifiers/{id}           # GET, PUT, DELETE
/prod/menu/modifiers/by-group/{id}  # GET - Modifiers by group
```

### Utility Endpoints

```
/prod/menu/version                  # GET - Menu version
/prod/menu/health                   # GET - Health check
```

## Benefits

### 1. **Logical Grouping**

- All menu-related functionality under `/menu`
- Clear separation between items, categories, and modifiers
- Easy to understand and navigate

### 2. **Parameterized Flexibility**

- `/menu/items/items` - Just the menu items (no modifier data)
- `/menu/items/modifiers` - Just the modifiers
- `/menu/items` - Both items and modifiers (future expansion)

### 3. **RESTful Design**

- Consistent naming conventions
- Predictable URL patterns
- Easy to extend with new resources

### 4. **Backward Compatibility**

- Can maintain old endpoints during transition
- Gradual migration path
- Clear deprecation timeline

## Implementation Plan

### Phase 1: Create New Endpoints

1. Add new API Gateway resources under `/menu`
2. Create new lambda functions or adapt existing ones
3. Test new endpoints alongside existing ones

### Phase 2: Update Frontend

1. Update API service calls to use new endpoints
2. Test thoroughly in staging
3. Deploy to production

### Phase 3: Deprecate Old Endpoints

1. Add deprecation warnings to old endpoints
2. Monitor usage
3. Remove old endpoints after migration period

## Example Usage

### Get Menu Items Only (No Modifiers)

```javascript
GET / prod / menu / items / items;
// Returns: { items: [...], count: 42 }
```

### Get Modifiers Only

```javascript
GET / prod / menu / items / modifiers;
// Returns: { modifierGroups: [...], modifiers: [...] }
```

### Get Everything (Future)

```javascript
GET / prod / menu / items;
// Returns: { items: [...], modifierGroups: [...], modifiers: [...] }
```

### Search Menu Items

```javascript
GET /prod/menu/items/search?query=taco
// Returns: { items: [...], query: "taco", count: 5 }
```

### Get Items by Category

```javascript
GET / prod / menu / items / by - category / 1;
// Returns: { items: [...], categoryId: 1, count: 8 }
```

## Migration Strategy

### Lambda Function Changes

1. **Create new unified lambda**: `getMenuItems` becomes more flexible
2. **Query parameters**: Use `?type=items|modifiers|all`
3. **Response format**: Consistent structure across all endpoints

### API Gateway Changes

1. **New resource hierarchy**: `/menu/{resource}/{subresource}`
2. **Method mappings**: Map to appropriate lambda functions
3. **CORS configuration**: Update for new paths

### Frontend Changes

1. **API service updates**: Point to new endpoints
2. **Error handling**: Handle new response formats
3. **Caching**: Update cache keys for new URLs

## Benefits for Current Issue

This new structure directly addresses the current optimization needs:

1. **Reduced Payload**: `/menu/items/items` returns only menu items without modifier data
2. **Flexible Queries**: Can easily add filters like `?include=modifiers` when needed
3. **Better Organization**: Clear separation of concerns
4. **Future-Proof**: Easy to extend without breaking existing functionality

## Next Steps

1. **Design Review**: Validate the proposed structure
2. **Implementation**: Start with core endpoints
3. **Testing**: Comprehensive testing of new structure
4. **Documentation**: Update API documentation
5. **Migration**: Plan for smooth transition from old to new endpoints
