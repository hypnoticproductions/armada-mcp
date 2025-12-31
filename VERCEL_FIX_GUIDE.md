# Vercel Deployment Fix Guide

## Issue
```
Module not found: Can't resolve '@/lib/utils'
```

This error occurs because shadcn-ui components (`button.tsx`, `card.tsx`) require a `utils` file that's missing.

---

## Quick Fix

### 1. Create `lib/utils.ts`

**Location:** In your Vercel project root (where `package.json` is)

**File:** `lib/utils.ts`

**Content:**
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 2. Install Dependencies

```bash
npm install clsx tailwind-merge
```

Or with yarn:
```bash
yarn add clsx tailwind-merge
```

### 3. Verify `tsconfig.json`

Make sure your `tsconfig.json` includes the path alias:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

If you're using the `src` directory structure:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 4. Commit and Push

```bash
git add lib/utils.ts package.json
git commit -m "fix: Add missing utils file for shadcn-ui components"
git push
```

Vercel will auto-deploy if you have auto-deployments enabled.

---

## Complete Command Sequence

```bash
# Navigate to your Vercel project directory
cd /path/to/your/vercel-project

# Create lib directory if it doesn't exist
mkdir -p lib

# Create utils.ts file
cat > lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

# Install dependencies
npm install clsx tailwind-merge

# Commit and push
git add lib/utils.ts package.json package-lock.json
git commit -m "fix: Add missing utils file for shadcn-ui components"
git push
```

---

## Alternative: If Using `src` Directory

If your project structure is:
```
src/
  app/
  components/
  lib/  ← Create here instead
```

Then create `src/lib/utils.ts` instead of `lib/utils.ts`:

```bash
mkdir -p src/lib
cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF
```

---

## Verify the Fix Locally

Before pushing, test the build locally:

```bash
npm run build
```

If the build succeeds, you're good to deploy!

---

## Troubleshooting

### Still getting "Module not found"?

1. **Check your import paths** in `button.tsx` and `card.tsx`:
   ```typescript
   import { cn } from "@/lib/utils"  // Should match your tsconfig paths
   ```

2. **Verify tsconfig.json** has correct paths:
   - If files are in `lib/`: `"@/*": ["./*"]`
   - If files are in `src/lib/`: `"@/*": ["./src/*"]`

3. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run build
   ```

4. **Check package.json** has dependencies:
   ```json
   {
     "dependencies": {
       "clsx": "^2.0.0",
       "tailwind-merge": "^2.0.0"
     }
   }
   ```

---

## Expected Result

After applying this fix:
- ✅ `npm run build` succeeds locally
- ✅ Vercel deployment succeeds
- ✅ No "Module not found" errors

---

## What This Fix Does

The `cn()` utility function combines Tailwind CSS classes intelligently:
- **clsx**: Conditionally joins class names
- **tailwind-merge**: Merges Tailwind classes without conflicts

This is required by shadcn-ui components for styling.

---

**Status:** Ready to apply
**Deployment:** Vercel will auto-deploy on push
