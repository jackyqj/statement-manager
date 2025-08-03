# GitLab CI/CD Pipeline for Statement Manager

This project includes a comprehensive GitLab CI/CD pipeline that automatically builds, tests, and deploys the application to GitLab Pages.

## Pipeline Overview

The pipeline consists of the following stages:

1. **Test Stage**: Install dependencies, lint code, run security scans
2. **Build Stage**: Build the React application and optionally build Docker images
3. **Deploy Stage**: Deploy to GitLab Pages

## Pipeline Jobs

### Test Stage Jobs

#### `install_dependencies`
- Installs Node.js dependencies
- Caches `node_modules` for faster subsequent builds
- Runs on merge requests, main branch, and tags

#### `lint_and_test`
- Runs ESLint to check code quality
- Ensures code follows project standards
- Runs on merge requests, main branch, and tags

#### `security_scan` (Optional)
- Runs `audit-ci` to check for security vulnerabilities
- Fails on moderate or higher severity issues
- Runs only on main branch and tags

#### `performance_test` (Optional)
- Analyzes build size and performance metrics
- Provides build optimization insights
- Runs only on main branch and tags

### Build Stage Jobs

#### `build_app`
- Builds the React application using Vite
- Creates optimized production build
- Artifacts are preserved for 1 week
- Runs on merge requests, main branch, and tags

#### `build_docker_image` (Manual)
- Builds and pushes Docker images to GitLab Container Registry
- Creates both tagged and latest versions
- Manual trigger only
- Runs on main branch and tags

### Deploy Stage Jobs

#### `deploy_to_pages`
- Deploys the built application to GitLab Pages
- Creates a `public/` directory with static files
- Sets up production environment
- Runs on main branch and tags

## Configuration

### Environment Variables

The pipeline uses the following GitLab CI/CD variables:

- `NODE_VERSION`: Set to "22" for Node.js version
- `PUBLIC_URL`: Set to "/statement-manager" for Pages deployment
- `CI_PAGES_URL`: Automatically set by GitLab for Pages URL

### Cache Strategy

- **Node modules**: Cached between jobs using branch-specific keys
- **Build artifacts**: Preserved for 1 week (build) and 30 days (deploy)
- **Cache policy**: Pull-push to optimize build times

### Rules and Conditions

Jobs run based on the following conditions:

- **Merge Requests**: Install, lint, and build jobs
- **Main Branch**: All jobs including deployment
- **Tags**: All jobs including deployment
- **Manual Jobs**: Docker build requires manual trigger

## GitLab Pages Setup

### Automatic Deployment

The pipeline automatically deploys to GitLab Pages when:

1. Code is pushed to the main branch
2. A tag is created
3. All previous stages pass successfully

### Pages URL

Your application will be available at:
```
https://<username>.gitlab.io/statement-manager/
```

### Custom Domain (Optional)

To use a custom domain:

1. Go to your GitLab project settings
2. Navigate to Pages section
3. Add your custom domain
4. Configure DNS settings

## Local Development

### Running Pipeline Locally

```bash
# Install GitLab Runner locally
# macOS: brew install gitlab-runner
# Linux: Follow GitLab Runner installation guide

# Run pipeline locally
gitlab-runner exec docker install_dependencies
gitlab-runner exec docker lint_and_test
gitlab-runner exec docker build_app
```

### Testing Build Locally

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Build application
npm run build

# Preview build
npm run preview
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Linting Errors
```bash
# Fix auto-fixable issues
npm run lint -- --fix

# Check specific files
npm run lint -- src/components/
```

#### Pages Deployment Issues
- Ensure `PUBLIC_URL` is correctly set
- Check that `dist/` directory is created
- Verify GitLab Pages is enabled for the project

### Pipeline Debugging

#### View Pipeline Logs
1. Go to your GitLab project
2. Navigate to CI/CD > Pipelines
3. Click on the pipeline ID
4. View job logs for detailed error information

#### Manual Pipeline Trigger
```bash
# Trigger pipeline manually
git push origin main

# Or create a tag
git tag v1.0.0
git push origin v1.0.0
```

## Performance Optimization

### Build Optimization

The pipeline includes several optimizations:

- **Caching**: Node modules are cached between builds
- **Parallel Jobs**: Independent jobs run in parallel
- **Artifact Management**: Build artifacts are preserved appropriately
- **Manual Chunks**: Vite build splits vendor code into chunks

### Docker Optimization

The Docker build job:

- Uses multi-stage builds for smaller images
- Leverages Docker layer caching
- Pushes both tagged and latest versions
- Uses GitLab Container Registry for storage

## Security

### Security Scanning

The pipeline includes:

- **Dependency scanning**: Checks for known vulnerabilities
- **Code quality**: ESLint ensures code standards
- **Build verification**: Ensures reproducible builds

### Best Practices

- All dependencies are locked with `package-lock.json`
- Security scans run on every build
- Manual jobs require explicit approval
- Artifacts have appropriate expiration times

## Monitoring

### Pipeline Metrics

Monitor your pipeline performance:

- **Build time**: Track how long builds take
- **Success rate**: Monitor job success rates
- **Cache hit rate**: Optimize caching strategy
- **Deployment frequency**: Track deployment cadence

### Pages Monitoring

- **Uptime**: Monitor Pages availability
- **Performance**: Track page load times
- **Errors**: Monitor for deployment issues

## Advanced Configuration

### Custom Variables

Add custom variables in GitLab:

1. Go to Settings > CI/CD
2. Expand Variables section
3. Add custom variables as needed

### Pipeline Schedules

Set up scheduled pipelines:

1. Go to CI/CD > Schedules
2. Create new schedule
3. Configure frequency and variables

### Deployment Environments

The pipeline creates environments:

- **Production**: GitLab Pages deployment
- **Staging**: Available for future use

## Support

For issues with the pipeline:

1. Check the job logs for detailed error messages
2. Verify all required variables are set
3. Ensure GitLab Pages is enabled
4. Contact the development team for assistance 