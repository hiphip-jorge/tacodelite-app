# Documentation

This directory contains all project documentation and guides.

## Files

- `README.md` - Main project overview and setup instructions
- `AUTH_SETUP.md` - Authentication setup and configuration guide
- `AWS_DEPLOYMENT.md` - AWS deployment instructions and architecture
- `DYNAMODB_SCHEMA.md` - Database schema documentation

## Quick Links

- **Getting Started**: See `README.md` for project setup
- **Authentication**: See `AUTH_SETUP.md` for auth configuration
- **Deployment**: See `AWS_DEPLOYMENT.md` for deployment instructions
- **Database**: See `DYNAMODB_SCHEMA.md` for data structure details

## Additional Documentation

- **Data Seeding**: See `../data/README.md` for seeding instructions
- **Scripts**: See `../scripts/README.md` for script documentation
- **Environment Files**: See `../env_files/README.md` for environment configuration
- **Infrastructure**: See `../terraform/README.md` for terraform documentation
- **CI/CD**: See `../.github/README.md` for GitHub Actions setup and deployment

## CI/CD Pipeline

This project uses GitHub Actions for automated deployment:

- **Staging**: Push to `staging` branch → Deploy to staging environment
- **Production**: Push to `main` branch → Deploy to production environment

See `../.github/README.md` for detailed setup instructions and required secrets.
