#!/bin/bash

# HLPFL Chatbot Deployment Script
# This script helps deploy the chatbot to various platforms

set -e

echo "🎵 HLPFL Chatbot Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    print_status "Node.js $(node --version) found"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    print_status "npm $(npm --version) found"
}

# Install dependencies
install_dependencies() {
    echo "Installing dependencies..."
    npm install
    cd client && npm install && cd ..
    print_status "Dependencies installed successfully"
}

# Build the application
build_application() {
    echo "Building application..."
    npm run build
    print_status "Application built successfully"
}

# Setup environment
setup_environment() {
    if [ ! -f .env ]; then
        print_warning "No .env file found. Creating from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your configuration"
    else
        print_status "Environment file found"
    fi
}

# Deploy to GitHub Pages (frontend only)
deploy_github_pages() {
    echo "Deploying to GitHub Pages..."
    
    # Build the React app
    cd client
    npm run build
    cd ..
    
    # Add homepage to package.json if not exists
    if ! grep -q "homepage" client/package.json; then
        sed -i 's/"private": true/"homepage": "https:\/\/HLPFLCG.github.io\/hlpflchatbot",\n  "private": true/' client/package.json
    fi
    
    print_status "Ready for GitHub Pages deployment"
    print_warning "Run the following commands to complete deployment:"
    echo "git add ."
    echo "git commit -m 'Deploy to GitHub Pages'"
    echo "git subtree push --prefix client/build origin gh-pages"
}

# Deploy to Heroku
deploy_heroku() {
    echo "Deploying to Heroku..."
    
    # Create Procfile if not exists
    if [ ! -f Procfile ]; then
        echo "web: npm start" > Procfile
        print_status "Created Procfile"
    fi
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Please install it first."
        exit 1
    fi
    
    print_status "Heroku CLI found. Run 'heroku create' and 'git push heroku main' to deploy."
}

# Deploy to Vercel
deploy_vercel() {
    echo "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Build the application
    npm run build
    
    print_status "Ready for Vercel deployment. Run 'vercel' to deploy."
}

# Local development setup
setup_dev() {
    echo "Setting up local development environment..."
    setup_environment
    install_dependencies
    print_status "Local development setup complete"
    print_warning "Run 'npm run dev' to start the development server"
}

# Production build
production_build() {
    echo "Creating production build..."
    setup_environment
    install_dependencies
    build_application
    print_status "Production build complete"
    print_warning "The build files are in client/build/"
}

# Main menu
show_menu() {
    echo ""
    echo "Choose deployment option:"
    echo "1) Setup local development"
    echo "2) Production build"
    echo "3) Deploy to GitHub Pages (frontend only)"
    echo "4) Deploy to Heroku"
    echo "5) Deploy to Vercel"
    echo "6) Exit"
    echo ""
    read -p "Enter your choice (1-6): " choice
}

# Main execution
main() {
    check_nodejs
    check_npm
    
    while true; do
        show_menu
        
        case $choice in
            1)
                setup_dev
                break
                ;;
            2)
                production_build
                break
                ;;
            3)
                deploy_github_pages
                break
                ;;
            4)
                deploy_heroku
                break
                ;;
            5)
                deploy_vercel
                break
                ;;
            6)
                echo "Goodbye! 🎵"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-6."
                ;;
        esac
    done
}

# Run main function
main "$@"