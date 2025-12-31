# Vercel Deployment Fix

## Quick Start

### Option 1: Automated Fix Script

```bash
# Copy apply-fix.sh to your Vercel project directory
# Then run:
cd /path/to/your/vercel-project
bash apply-fix.sh
```

The script will:
- ✅ Detect your project structure (src/ or root)
- ✅ Create lib/utils.ts in the correct location
- ✅ Install required dependencies
- ✅ Test the build
- ✅ Show you the git commands to push

### Option 2: Manual Fix

**1. Copy the utils.ts file:**
```bash
# If using src/ directory:
cp vercel-fix/lib/utils.ts /path/to/your/project/src/lib/utils.ts

# If NOT using src/ directory:
cp vercel-fix/lib/utils.ts /path/to/your/project/lib/utils.ts
```

**2. Install dependencies:**
```bash
cd /path/to/your/project
npm install clsx tailwind-merge
```

**3. Commit and push:**
```bash
git add lib/utils.ts package.json
git commit -m "fix: Add missing utils file"
git push
```

## Files Included

```
vercel-fix/
├── README.md           ← This file
├── apply-fix.sh        ← Automated fix script
└── lib/
    └── utils.ts        ← The missing utils file
```

## What This Fixes

**Error:**
```
Module not found: Can't resolve '@/lib/utils'
```

**Solution:**
Adds the `cn()` utility function required by shadcn-ui components (button, card, etc.)

## Support

See `VERCEL_FIX_GUIDE.md` for detailed troubleshooting.
