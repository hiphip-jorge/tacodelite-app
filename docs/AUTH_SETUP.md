# Authentication & User Management Setup

This guide covers setting up authentication for the Taco Delite admin panel.

## 🏗️ **Architecture Overview**

### **Components:**

1. **Admin Users Table** - DynamoDB table for storing admin user accounts
2. **Login Lambda** - Handles user authentication and JWT token generation
3. **Verify Lambda** - Validates JWT tokens for protected routes
4. **Admin App** - React frontend with authentication hooks

### **Authentication Flow:**

1. User enters credentials on `/admin/login`
2. Login Lambda validates credentials against DynamoDB
3. If valid, returns JWT token with user info
4. Frontend stores token in localStorage
5. Protected routes verify token with Verify Lambda
6. Token expires after 24 hours

## 🚀 **Deployment Steps**

### **1. Deploy Infrastructure**

```bash
# Deploy Terraform infrastructure
terraform apply -var-file=staging.tfvars

# Set JWT secret (IMPORTANT: Use a strong secret in production!)
export JWT_SECRET="your-super-secret-key-change-this-in-production"
```

### **2. Build Lambda Functions**

```bash
# Build authentication Lambda functions
./build-auth-lambda.sh
```

### **3. Deploy Lambda Functions**

```bash
# Deploy Lambda functions (Terraform will handle this)
terraform apply -var-file=staging.tfvars
```

### **4. Seed Admin Users**

```bash
# Install dependencies
npm install aws-sdk bcryptjs

# Set environment variable
export ADMIN_USERS_TABLE="tacodelite-app-admin-users-staging"

# For PRODUCTION (generates secure random credentials)
node seed-admin-users.js

# For DEVELOPMENT (uses predictable credentials for testing)
node seed-admin-users-dev.js
```

### **5. Deploy Admin App**

```bash
# From tacodelite-admin directory
npm run build
./upload-admin.sh
```

## 🔐 **Default Credentials**

After seeding, you'll have these accounts:

**Production (secure):**

- The script generates a secure random 16-character password
- Credentials are displayed only once during seeding
- Save them securely and share only with authorized personnel

**Development (testing):**

- **Admin:** `admin@tacodelite.com` / `password123`
- Only use for development/testing environments

⚠️ **IMPORTANT:** Change these passwords immediately in production!

## 🗄️ **Database Schema**

### **Admin Users Table Structure:**

```json
{
    "pk": "ADMIN#001",
    "email": "admin@tacodelite.com",
    "name": "Admin User",
    "passwordHash": "$2a$12$...", // bcrypt hash
    "role": "admin",
    "active": true,
    "createdAt": "2024-01-15T12:00:00Z",
    "lastLogin": "2024-01-15T14:30:00Z"
}
```

### **User Roles:**

- **admin** - Full access to all features
- **manager** - Limited access (can be customized)

## 🔧 **API Endpoints**

### **Login**

- **URL:** `POST /admin/login`
- **Body:** `{ "email": "...", "password": "..." }`
- **Response:** `{ "success": true, "token": "...", "user": {...} }`

### **Verify Token**

- **URL:** `GET /admin/verify`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "success": true, "user": {...} }`

## 🛡️ **Security Considerations**

### **1. JWT Secret**

- Use a strong, random secret key
- Store in environment variables
- Rotate periodically

### **2. Password Security**

- Passwords are hashed with bcrypt (12 rounds)
- Enforce strong password policies
- Implement password reset functionality

### **3. Token Management**

- Tokens expire after 24 hours
- Store tokens securely in localStorage
- Implement token refresh mechanism

### **4. CORS Configuration**

- Restrict origins to your domain
- Configure proper headers

## 🔄 **Adding New Admin Users**

### **Via Script:**

```javascript
// Add to seed-admin-users.js
{
    id: 'ADMIN#003',
    email: 'newadmin@tacodelite.com',
    name: 'New Admin',
    password: 'securepassword123',
    role: 'admin',
    active: true
}
```

### **Via AWS Console:**

1. Navigate to DynamoDB console
2. Find your admin users table
3. Add new item with required fields
4. Hash password using bcrypt

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **"Invalid credentials"**
    - Check if user exists in DynamoDB
    - Verify password hash is correct
    - Ensure user is active

2. **"Token verification failed"**
    - Check JWT secret matches
    - Verify token hasn't expired
    - Ensure user still exists and is active

3. **CORS errors**
    - Check allowed origins configuration
    - Verify API Gateway CORS settings

4. **Lambda function errors**
    - Check CloudWatch logs
    - Verify environment variables
    - Ensure IAM permissions

## 📝 **Environment Variables**

### **Required Variables:**

- `JWT_SECRET` - Secret key for JWT signing
- `ADMIN_USERS_TABLE` - DynamoDB table name
- `ALLOWED_ORIGINS` - CORS origins

### **Example .env file:**

```env
JWT_SECRET=your-super-secret-key-here
ADMIN_USERS_TABLE=tacodelite-app-admin-users-staging
ALLOWED_ORIGINS=https://staging.tacodelitewestplano.com
```

## 🔮 **Future Enhancements**

- [ ] Password reset functionality
- [ ] Multi-factor authentication
- [ ] Session management
- [ ] Audit logging
- [ ] Role-based permissions
- [ ] User management UI
- [ ] API rate limiting
