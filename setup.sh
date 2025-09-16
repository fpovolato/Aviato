#!/bin/bash

# Aviato Setup Script
# This script sets up the Docker environment and seeds the database if needed

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    print_status "Checking if Docker is running..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if SSL certificates exist and create them if needed
check_ssl_certs() {
    print_status "Checking SSL certificates..."
    if [[ ! -f "./certs/localhost.pem" ]] || [[ ! -f "./certs/localhost-key.pem" ]]; then
        print_warning "SSL certificates not found. Creating self-signed certificates..."
        
        # Create certs directory if it doesn't exist
        mkdir -p certs
        
        # Generate self-signed certificates
        openssl req -x509 -newkey rsa:2048 -nodes \
            -keyout certs/localhost-key.pem -out certs/localhost.pem \
            -days 365 -subj "/CN=localhost" > /dev/null 2>&1
            
        if [[ -f "./certs/localhost.pem" ]] && [[ -f "./certs/localhost-key.pem" ]]; then
            print_success "SSL certificates created successfully"
        else
            print_error "Failed to create SSL certificates"
            exit 1
        fi
    else
        print_success "SSL certificates found"
    fi
}

# Function to start Docker services
start_services() {
    print_status "Starting Docker services..."
    docker compose down > /dev/null 2>&1 || true
    build_frontend "dashboard" "npm run build -- --configuration production"
    build_frontend "site" "npm run build -- --configuration production"
    build_backend_on_host

    docker compose up -d --build
    
    print_status "Waiting for services to be ready..."
    
    # Wait for MongoDB to be ready
    print_status "Waiting for MongoDB..."
    local mongo_attempts=30
    local mongo_attempt=1
    while [ $mongo_attempt -le $mongo_attempts ]; do
        if docker compose exec -T mongo mongosh --quiet --eval "db.runCommand('ping').ok" > /dev/null 2>&1; then
            break
        fi
        sleep 2
        mongo_attempt=$((mongo_attempt + 1))
    done
    
    if [ $mongo_attempt -gt $mongo_attempts ]; then
        print_error "MongoDB failed to start within expected time"
        exit 1
    fi
    print_success "MongoDB is ready"
    
    # Wait for backend to be ready
    print_status "Waiting for backend..."
    local backend_attempts=30
    local backend_attempt=1
    while [ $backend_attempt -le $backend_attempts ]; do
        if curl -k -s https://localhost:3443/api/users > /dev/null 2>&1; then
            break
        fi
        sleep 2
        backend_attempt=$((backend_attempt + 1))
    done
    
    if [ $backend_attempt -gt $backend_attempts ]; then
        print_error "Backend failed to start within expected time"
        exit 1
    fi
    
    print_success "Backend is ready"
}

# Function to check if database has data
check_database() {
    print_status "Checking database for existing data..."
    
    # Count users in the database
    local user_count=$(docker compose exec -T mongo mongosh --quiet backenddb --eval "db.users.countDocuments()" 2>/dev/null || echo "0")
    
    if [[ "$user_count" =~ ^[0-9]+$ ]] && [ "$user_count" -gt 0 ]; then
        print_success "Database contains $user_count users - data exists"
        return 0  # Data exists
    else
        print_warning "Database appears to be empty"
        return 1  # No data
    fi
}

# Function to seed the database
seed_database() {
    print_status "Seeding database with mock data..."
    
    # Run seed script inside backend container
    if docker compose exec -T backend node seed.js; then
        print_success "Database seeded successfully"
    else
        print_error "Database seeding failed"
        exit 1
    fi
}

build_frontend() {
  local dir="$1"
  local build_cmd="$2"

  print_status "Building frontend ($dir) on host..."
  pushd "$dir" > /dev/null

  # Prova prima con ci (deterministico)
  if ! npm ci --no-audit --no-fund; then
    print_warning "'npm ci' failed — trying 'npm install' to sync lockfile..."
    rm -rf node_modules
    npm install
  fi

  $build_cmd
  popd > /dev/null
  print_success "Built $dir"
}

build_backend_on_host() {
  print_status "Preparing backend on host..."
  pushd backend > /dev/null
  if ! npm ci --no-audit --no-fund; then
    print_warning "'npm ci' failed — using 'npm install' to sync lockfile..."
    rm -rf node_modules
    npm install
  fi
  npm prune --omit=dev
  popd > /dev/null
  print_success "Backend ready"
}
# ...e chiamalo prima dell'up
build_backend_on_host



# Function to show service URLs
show_services() {
    echo ""
    echo -e "${GREEN}🎉 Aviato is ready!${NC}"
    echo ""
    echo "📱 Services available at:"
    echo -e "  ${BLUE}Backend API:${NC}     https://localhost:3443"
    echo -e "  ${BLUE}Dashboard:${NC}       https://localhost:4443 (admin/manager interface)"
    echo -e "  ${BLUE}Customer Site:${NC}   https://localhost:4543 (customer interface)"
    echo -e "  ${BLUE}MongoDB:${NC}         localhost:27017"
    echo ""
    echo "🔑 Default credentials:"
    echo "  Admin:     admin@aviato.com / password"
    echo "  Manager:   manager1@av.com / password"
    echo "  Employee:  employee1@av.com / password"
    echo "  Customer:  customer1@gmail.com / password"
    echo ""
    echo -e "${YELLOW}Note: You may see SSL warnings in your browser for self-signed certificates${NC}"
    echo ""
}

# Function to handle cleanup on exit
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Setup failed. Check the logs above for details."
        echo ""
        echo "To clean up and try again:"
        echo "  docker compose down"
        echo "  ./setup.sh"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════╗"
    echo "║           AVIATO SETUP               ║"
    echo "║     Flight Booking Platform          ║"
    echo "╚══════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Set up error handling
    trap cleanup EXIT
    
    # Perform setup steps
    check_docker
    check_ssl_certs
    start_services
    
    # Check if database needs seeding
    if ! check_database; then
        echo ""
        read -p "Database is empty. Do you want to seed it with mock data? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
            seed_database
        else
            print_warning "Skipping database seeding"
        fi
    fi
    
    show_services
    
    # Remove error trap since we succeeded
    trap - EXIT
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi