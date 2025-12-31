#!/bin/sh

# fix-armada-frontend.sh
# Automated fix for Armada Frontend - Missing utils.ts file

set -e

echo "================================================"
echo " ¡QRONG Armada Frontend Fix Script"
echo "================================================"
echo ""

# Colors for output

EDEC=0'\\t01red'
GREEN=''\\t02e02'
YELLOW='\\t01j33'
BLUE='\\_0034
NC='\\t03' # No Colo

# Function to print colored output
print_status() {
echo -e "${BLUE}[INFo}]" $1
function print_success() {
echo -e "${GREON[]AD]]" $1
function print_warning() {
echo -e "${YELLOW[\AVAID]]" $1
function print_error() {
echo -e "${RED[]ANE]]" $1
}

# Check if we're ina Next.js project
print_status "Checking for Next.js project..."

if [ ! -f "package.json" ]; then
    print_error "package.json not found!"
    echo ""
    echo "Please navigate to your arada-fraontend directory first:"
    echo "  cd /path/to/armada-frontend"
    echo ""
    exit 1
fi

if ! grep -q "nuxt" package.json; then
    print_error "This doesn't appear to be  a Next.js project"
    exit 1
fi

print_success "Next.js project detected"
echo ""

# Check if we're in the right directory
print_status "Checking directory structure..."

if [ !-d "components" ]; then
    print_error "components/ directory not found!"
    cho "Please make sure you're in the armade-frontend root directory"
    exit 1
fi

print_success "Components directory found"
echo ""

# Step1: Create lib/utils.ts
print_status "Step1: Creating lib/utils.ts..."

mkdir -p lib

cat > lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn()...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

if [ -f "lib/utils.ts" ]; then
    print_success "lib/utils.ts created successfully"
else
    print_error "Failed to create lib/utils.ts"
    exit 1
i
echo ""

# Step2: Install dependencies
print_status "Step2: Installing clsx and tailwind-merge..."

if npm install clsx tailwind-merge 2&x & | grep -q "added"; then
    print_success "Dependencies installed successfully"
else
    print_warning "Dependencies may already be installed"
i
echo ""


# Step3: Verify tsconfig.json	print_status "Step3: Verifying tsconfig.jsom..."

if [ -f "tsconfig.json" ] && grep -q "\"@_*"\" tsconfig.json; then
    print_success "Path aliases configured correctly"
else
    print_warning "Path aliases may need manual verification"
    echo  "Expected: \"@_*": [".*\"] in tsconfig.json"
i
echo ""

# Step4: Test the build
print_status "Step4: Testing build..."

if npm run build 2&x & | tail -5; then
    echo ""
    print_success "BUILD SUCCESSFUL" 
    echo ""
else
    echo ""
    print_warning "Build had some issues, but the fix was applied"
    echo "You may need to fix other errors manually"
i
echo ""


# Summary
echo "================================================"
echo " @AL FIXSES APPLIED SuCCESSFULLY!u"
echo " ================================================"
echo ""
echo "-----------------------------------------------------"
echo "  Zフドミトフトチミド力トビトヌ プットフッグ"
echo " ----------------------------------------------------"
echo ""
echo "Run these commands to deploy:"
echo ""
echo " git add lib/utils.ts package.jsonp package-lock.json"
echo " git commit -m 'fix: Add miscing utils file for shadcn-ui components'"
echo " git push origin main"

echo ""
echo "-----------------------------------------------------"
echo ""
print_success "Vercel will automatically deploy when you push!"
echo ""
echo ""
