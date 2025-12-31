#!/bin/bash
# Vercel Deployment Fix - Apply this in your Vercel project directory

set -e

echo "🔧 Applying Vercel Deployment Fix..."
echo ""

# Check if we're in a Next.js project
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Are you in your Vercel project directory?"
  echo "Usage: bash apply-fix.sh"
  exit 1
fi

echo "✓ Found package.json"

# Detect if using src directory
if [ -d "src" ]; then
  echo "✓ Detected src/ directory structure"
  LIB_DIR="src/lib"
else
  echo "✓ Using root directory structure"
  LIB_DIR="lib"
fi

# Create lib directory
echo "📁 Creating ${LIB_DIR} directory..."
mkdir -p "${LIB_DIR}"

# Create utils.ts
echo "📝 Creating utils.ts..."
cat > "${LIB_DIR}/utils.ts" << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

echo "✓ Created ${LIB_DIR}/utils.ts"

# Install dependencies
echo "📦 Installing dependencies..."
if [ -f "package-lock.json" ]; then
  npm install clsx tailwind-merge
elif [ -f "yarn.lock" ]; then
  yarn add clsx tailwind-merge
elif [ -f "pnpm-lock.yaml" ]; then
  pnpm add clsx tailwind-merge
else
  npm install clsx tailwind-merge
fi

echo "✓ Dependencies installed"

# Test build
echo ""
echo "🧪 Testing build..."
if npm run build; then
  echo ""
  echo "✅ Build successful!"
  echo ""
  echo "📤 Ready to commit and push:"
  echo "   git add ${LIB_DIR}/utils.ts package.json"
  echo "   git commit -m 'fix: Add missing utils file for shadcn-ui components'"
  echo "   git push"
else
  echo ""
  echo "⚠️  Build failed. Check the errors above."
  exit 1
fi
