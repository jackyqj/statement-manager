# Podman Setup for Statement Manager

Podman is a drop-in replacement for Docker that can run containers without requiring a daemon. This guide shows how to use Podman with the Statement Manager application.

## Prerequisites

Make sure you have Podman installed:
```bash
# macOS (using Homebrew)
brew install podman

# Ubuntu/Debian
sudo apt-get install podman

# CentOS/RHEL/Fedora
sudo dnf install podman
```

## Quick Start with Podman Compose

### Development Mode
```bash
# Start development server
podman-compose --profile dev up

# Or with enhanced hot reload
podman-compose --profile hot up
```

### Production Mode
```bash
# Start production server
podman-compose --profile prod up --build
```

## Direct Podman Commands

### Build Images
```bash
# Build development image
podman build --target development -t statement-manager-dev .

# Build production image
podman build --target production -t statement-manager-prod .
```

### Run Development Container
```bash
# Run development server
podman run -it --rm \
  -p 5173:5173 \
  -v .:/app:Z \
  -v /app/node_modules \
  -e NODE_ENV=development \
  -e CHOKIDAR_USEPOLLING=true \
  statement-manager-dev

# Access at: http://localhost:5173
```

### Run Production Container
```bash
# Run production server
podman run -d --rm \
  -p 80:80 \
  -e NODE_ENV=production \
  statement-manager-prod

# Access at: http://localhost
```

### Run with Enhanced Hot Reload
```bash
# Run with better file watching
podman run -it --rm \
  -p 3000:5173 \
  -v .:/app:Z \
  -v /app/node_modules \
  -e NODE_ENV=development \
  -e CHOKIDAR_USEPOLLING=true \
  -e WATCHPACK_POLLING=true \
  statement-manager-dev

# Access at: http://localhost:3000
```

## Podman Compose vs Docker Compose

### Using podman-compose
```bash
# Install podman-compose if not already installed
pip install podman-compose

# Use exactly like docker-compose
podman-compose --profile dev up
podman-compose --profile prod up
podman-compose down
```

### Using Docker Compose with Podman
```bash
# Set environment variable to use Podman
export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_BUILDKIT=1

# Use docker-compose with Podman backend
DOCKER_HOST=unix:///tmp/podman.sock docker-compose --profile dev up
```

## Podman-Specific Features

### Rootless Containers
```bash
# Run containers as non-root user (default in Podman)
podman run -it --rm \
  -p 5173:5173 \
  -v .:/app:Z \
  statement-manager-dev
```

### Pod Management
```bash
# Create a pod for multiple services
podman pod create --name statement-manager-pod -p 5173:5173

# Add development container to pod
podman run -d --pod statement-manager-pod \
  -v .:/app:Z \
  statement-manager-dev

# List pods
podman pod ls

# Stop and remove pod
podman pod stop statement-manager-pod
podman pod rm statement-manager-pod
```

### Volume Management
```bash
# Create a named volume
podman volume create statement-manager-data

# Use named volume
podman run -it --rm \
  -p 5173:5173 \
  -v .:/app:Z \
  -v statement-manager-data:/app/data \
  statement-manager-dev
```

## Troubleshooting

### Permission Issues
```bash
# If you encounter permission issues with volumes
podman run -it --rm \
  -p 5173:5173 \
  -v .:/app:Z \
  --userns=keep-id \
  statement-manager-dev
```

### SELinux Issues (Linux)
```bash
# Add :Z flag for SELinux contexts
podman run -it --rm \
  -p 5173:5173 \
  -v .:/app:Z \
  statement-manager-dev
```

### Port Conflicts
```bash
# Use different port if 5173 is busy
podman run -it --rm \
  -p 8080:5173 \
  -v .:/app:Z \
  statement-manager-dev

# Access at: http://localhost:8080
```

### Network Issues
```bash
# Create custom network
podman network create statement-manager-net

# Use custom network
podman run -it --rm \
  --network statement-manager-net \
  -p 5173:5173 \
  -v .:/app:Z \
  statement-manager-dev
```

## Performance Tips

### Use Buildah for Faster Builds
```bash
# Install buildah
# macOS: brew install buildah
# Linux: dnf install buildah

# Build with buildah
buildah bud --target development -t statement-manager-dev .
```

### Optimize for Development
```bash
# Use overlay mount for better performance
podman run -it --rm \
  -p 5173:5173 \
  -v .:/app:overlay \
  statement-manager-dev
```

## Health Checks

### Check Container Health
```bash
# Check if container is running
podman ps

# Check container logs
podman logs <container_id>

# Execute commands in running container
podman exec -it <container_id> /bin/sh
```

### Production Health Check
```bash
# Test production health endpoint
curl http://localhost/health
```

## Cleanup

### Remove All Containers
```bash
# Stop all containers
podman stop -a

# Remove all containers
podman rm -a

# Remove all images
podman rmi -a

# Remove all volumes
podman volume rm -a
```

### System Cleanup
```bash
# Remove unused containers, images, networks
podman system prune -a

# Remove all unused data
podman system prune -a --volumes
```

## Migration from Docker

If you're migrating from Docker to Podman:

1. **Install Podman**: Follow installation instructions for your OS
2. **Replace commands**: Use `podman` instead of `docker`
3. **Use podman-compose**: Install and use `podman-compose` instead of `docker-compose`
4. **Update scripts**: Replace `docker` commands with `podman` in your scripts

## Environment Variables

The same environment variables work with Podman:

- `NODE_ENV`: Set to `development` or `production`
- `CHOKIDAR_USEPOLLING`: Enable file watching in containers
- `WATCHPACK_POLLING`: Enhanced file watching for hot reload 