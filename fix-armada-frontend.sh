#!/bin/bash
# Complete fix for armada-frontend Vercel deployment
# Run this script in your armada-frontend directory

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   ARMADA Frontend - Complete Vercel Deployment Fix            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: package.json not found${NC}"
  echo ""
  echo "This script must be run from your armada-frontend directory."
  echo ""
  echo "Usage:"
  echo "  cd /path/to/armada-frontend"
  echo "  bash fix-armada-frontend.sh"
  echo ""
  exit 1
fi

echo -e "${GREEN}✓${NC} Found package.json"

# Verify it's a Next.js project
if ! grep -q "next" package.json; then
  echo -e "${YELLOW}⚠${NC}  Warning: Doesn't look like a Next.js project"
  echo "Continuing anyway..."
fi

# Detect directory structure
if [ -d "src" ]; then
  echo -e "${GREEN}✓${NC} Detected src/ directory structure"
  LIB_DIR="src/lib"
  APP_DIR="src/app"
  COMPONENTS_DIR="src/components"
else
  echo -e "${GREEN}✓${NC} Using root directory structure"
  LIB_DIR="lib"
  APP_DIR="app"
  COMPONENTS_DIR="components"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 1: Creating missing lib/utils.ts file"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create lib directory
mkdir -p "${LIB_DIR}"
echo -e "${GREEN}✓${NC} Created ${LIB_DIR}/ directory"

# Create utils.ts
cat > "${LIB_DIR}/utils.ts" << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

echo -e "${GREEN}✓${NC} Created ${LIB_DIR}/utils.ts"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 2: Installing required dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detect package manager
if [ -f "package-lock.json" ]; then
  echo "Using npm..."
  npm install clsx tailwind-merge
elif [ -f "yarn.lock" ]; then
  echo "Using yarn..."
  yarn add clsx tailwind-merge
elif [ -f "pnpm-lock.yaml" ]; then
  echo "Using pnpm..."
  pnpm add clsx tailwind-merge
else
  echo "Using npm (default)..."
  npm install clsx tailwind-merge
fi

echo -e "${GREEN}✓${NC} Installed clsx and tailwind-merge"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 3: Verifying tsconfig.json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "tsconfig.json" ]; then
  if grep -q '"@/\*"' tsconfig.json; then
    echo -e "${GREEN}✓${NC} Path alias @/* is configured"
  else
    echo -e "${YELLOW}⚠${NC}  Path alias @/* not found in tsconfig.json"
    echo "You may need to add it manually:"
    echo ""
    echo '  "compilerOptions": {'
    echo '    "baseUrl": ".",'
    echo '    "paths": {'
    echo '      "@/*": ["./*"]  // or ["./src/*"] if using src/'
    echo '    }'
    echo '  }'
  fi
else
  echo -e "${YELLOW}⚠${NC}  No tsconfig.json found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 4: Testing build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if npm run build; then
  echo ""
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                    ✅ BUILD SUCCESSFUL!                        ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "All fixes applied successfully!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Next Steps: Commit and Push"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Run these commands to deploy:"
  echo ""
  echo -e "${BLUE}git add ${LIB_DIR}/utils.ts package.json package-lock.json${NC}"
  echo -e "${BLUE}git commit -m 'fix: Add missing utils file for shadcn-ui components'${NC}"
  echo -e "${BLUE}git push origin main${NC}"
  echo ""
  echo "Vercel will automatically deploy when you push!"
  echo ""
else
  echo ""
  echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║                    ❌ BUILD FAILED                             ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "The build failed. Check the errors above."
  echo "Common issues:"
  echo ""
  echo "1. Missing tsconfig.json path aliases"
  echo "2. Import paths don't match (@/ vs ./ vs ../)"
  echo "3. Other dependency issues"
  echo ""
  echo "Run: npm run build"
  echo "To see detailed error messages"
  echo ""
  exit 1
fi
