# Docker Setup for Statement Manager

This project includes Docker configuration for both development and production environments.

**Node.js Version**: This project requires Node.js 22+ (specified in `.nvmrc` and `package.json`).

## Quick Start

### Development Mode
```bash
# Start development server with hot reload
docker-compose --profile dev up

# Or with enhanced hot reload
docker-compose --profile hot up
```

### Production Mode
```bash
# Start production server
docker-compose --profile prod up
```

## Services

### Development Services
- **statement-manager-dev**: Development server on port 5173
- **statement-manager-hot**: Development server with enhanced hot reload on port 3000

### Production Service
- **statement-manager-prod**: Production server using nginx on port 80

## Usage Examples

### Development with Hot Reload
```bash
# Start development environment
docker-compose --profile dev up

# Access the application
open http://localhost:5173
```

### Production Build
```bash
# Build and start production environment
docker-compose --profile prod up --build

# Access the application
open http://localhost
```

### Development with Enhanced Hot Reload
```bash
# Start with enhanced file watching
docker-compose --profile hot up

# Access the application
open http://localhost:3000
```

## Docker Commands

### Build Images
```bash
# Build development image
docker-compose --profile dev build

# Build production image
docker-compose --profile prod build
```

### View Logs
```bash
# Development logs
docker-compose --profile dev logs -f

# Production logs
docker-compose --profile prod logs -f
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop specific profile
docker-compose --profile dev down
```

### Clean Up
```bash
# Remove containers and networks
docker-compose down --remove-orphans

# Remove images
docker-compose down --rmi all
```

## Environment Variables

The following environment variables are available:

- `NODE_ENV`: Set to `development` or `production`
- `CHOKIDAR_USEPOLLING`: Enable file watching in Docker (development)
- `WATCHPACK_POLLING`: Enhanced file watching (hot reload profile)

## File Structure

```
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf             # Nginx configuration for production
├── .dockerignore          # Files to exclude from Docker build
└── DOCKER_README.md       # This file
```

## Troubleshooting

### Port Already in Use
If port 5173 or 80 is already in use, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8080:5173"  # Change 5173 to 8080
```

### Hot Reload Not Working
For better hot reload in Docker, use the `hot` profile:
```bash
docker-compose --profile hot up
```

### Build Issues
If you encounter build issues, try:
```bash
# Clean build
docker-compose build --no-cache

# Remove all containers and images
docker system prune -a
```

## Health Check

The production service includes a health check endpoint:
```bash
curl http://localhost/health
```

Should return: `healthy` 