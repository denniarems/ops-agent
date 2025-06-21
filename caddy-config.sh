#!/bin/bash

# Caddy Configuration Management Script
# This script helps switch between development and production Caddy configurations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CADDYFILE="$SCRIPT_DIR/Caddyfile"
CADDYFILE_PROD="$SCRIPT_DIR/Caddyfile.production"
CADDYFILE_DEV="$SCRIPT_DIR/Caddyfile.development"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev                 Switch to development configuration"
    echo "  prod [domain]       Switch to production configuration"
    echo "  status              Show current configuration status"
    echo "  backup              Backup current Caddyfile"
    echo "  restore             Restore from backup"
    echo "  validate            Validate current Caddyfile"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev"
    echo "  $0 prod example.com"
    echo "  $0 status"
    echo ""
}

# Function to backup current Caddyfile
backup_caddyfile() {
    if [[ -f "$CADDYFILE" ]]; then
        local backup_file="$CADDYFILE.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$CADDYFILE" "$backup_file"
        print_status "Backed up current Caddyfile to: $backup_file"
    else
        print_warning "No Caddyfile found to backup"
    fi
}

# Function to switch to development configuration
switch_to_dev() {
    print_header "Switching to Development Configuration"
    
    # Create development Caddyfile if it doesn't exist
    if [[ ! -f "$CADDYFILE_DEV" ]]; then
        print_status "Creating development Caddyfile..."
        cp "$CADDYFILE" "$CADDYFILE_DEV" 2>/dev/null || true
    fi
    
    # Backup current if it exists
    backup_caddyfile
    
    # Copy development config
    if [[ -f "$CADDYFILE_DEV" ]]; then
        cp "$CADDYFILE_DEV" "$CADDYFILE"
        print_status "Switched to development configuration"
    else
        print_error "Development Caddyfile not found"
        return 1
    fi
    
    print_status "Development configuration active:"
    echo "  - HTTP only (port 80)"
    echo "  - CORS enabled"
    echo "  - Local certificates disabled"
    echo "  - Access via: http://localhost"
}

# Function to switch to production configuration
switch_to_prod() {
    local domain="$1"
    
    print_header "Switching to Production Configuration"
    
    if [[ -z "$domain" ]]; then
        print_error "Domain name required for production configuration"
        echo "Usage: $0 prod <domain>"
        return 1
    fi
    
    # Validate domain format
    if [[ ! "$domain" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
        print_warning "Domain format may be invalid: $domain"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Aborted"
            return 1
        fi
    fi
    
    # Backup current if it exists
    backup_caddyfile
    
    # Copy production config and replace domain
    if [[ -f "$CADDYFILE_PROD" ]]; then
        sed "s/your-domain\.com/$domain/g" "$CADDYFILE_PROD" > "$CADDYFILE"
        print_status "Switched to production configuration for domain: $domain"
    else
        print_error "Production Caddyfile template not found"
        return 1
    fi
    
    print_warning "Remember to:"
    echo "  1. Update the email address in Caddyfile for Let's Encrypt"
    echo "  2. Ensure DNS points to this server"
    echo "  3. Open ports 80 and 443 in firewall"
    echo "  4. Restart Caddy: docker-compose restart caddy"
}

# Function to show current status
show_status() {
    print_header "Caddy Configuration Status"
    
    if [[ -f "$CADDYFILE" ]]; then
        print_status "Caddyfile exists"
        
        # Check if it's development or production config
        if grep -q "auto_https off" "$CADDYFILE"; then
            echo "  Configuration: Development (HTTP only)"
        elif grep -q "your-domain.com" "$CADDYFILE"; then
            echo "  Configuration: Production template (needs domain update)"
        else
            echo "  Configuration: Production (HTTPS enabled)"
        fi
        
        # Show configured domains
        local domains=$(grep -E "^[a-zA-Z0-9.-]+\s*{" "$CADDYFILE" | sed 's/\s*{.*//' | tr '\n' ' ')
        if [[ -n "$domains" ]]; then
            echo "  Configured domains: $domains"
        fi
        
        # Check if Caddy is running
        if docker-compose ps caddy 2>/dev/null | grep -q "Up"; then
            echo "  Status: Running"
        else
            echo "  Status: Not running"
        fi
    else
        print_error "No Caddyfile found"
    fi
}

# Function to validate Caddyfile
validate_caddyfile() {
    print_header "Validating Caddyfile"
    
    if [[ ! -f "$CADDYFILE" ]]; then
        print_error "No Caddyfile found"
        return 1
    fi
    
    # Use Caddy to validate the configuration
    if command -v caddy >/dev/null 2>&1; then
        if caddy validate --config "$CADDYFILE"; then
            print_status "Caddyfile is valid"
        else
            print_error "Caddyfile validation failed"
            return 1
        fi
    else
        # Use Docker to validate
        if docker run --rm -v "$SCRIPT_DIR:/etc/caddy" caddy:2.8-alpine caddy validate --config /etc/caddy/Caddyfile; then
            print_status "Caddyfile is valid"
        else
            print_error "Caddyfile validation failed"
            return 1
        fi
    fi
}

# Function to restore from backup
restore_backup() {
    print_header "Restore from Backup"
    
    # Find backup files
    local backups=($(ls -1 "$SCRIPT_DIR"/Caddyfile.backup.* 2>/dev/null | sort -r))
    
    if [[ ${#backups[@]} -eq 0 ]]; then
        print_error "No backup files found"
        return 1
    fi
    
    echo "Available backups:"
    for i in "${!backups[@]}"; do
        local backup_file="${backups[$i]}"
        local backup_date=$(basename "$backup_file" | sed 's/Caddyfile.backup.//')
        echo "  $((i+1)). $backup_date"
    done
    
    read -p "Select backup to restore (1-${#backups[@]}): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[1-9][0-9]*$ ]] && [[ $REPLY -le ${#backups[@]} ]]; then
        local selected_backup="${backups[$((REPLY-1))]}"
        backup_caddyfile  # Backup current before restoring
        cp "$selected_backup" "$CADDYFILE"
        print_status "Restored from backup: $(basename "$selected_backup")"
    else
        print_error "Invalid selection"
        return 1
    fi
}

# Main script logic
case "${1:-help}" in
    "dev")
        switch_to_dev
        ;;
    "prod")
        switch_to_prod "$2"
        ;;
    "status")
        show_status
        ;;
    "backup")
        backup_caddyfile
        ;;
    "restore")
        restore_backup
        ;;
    "validate")
        validate_caddyfile
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
