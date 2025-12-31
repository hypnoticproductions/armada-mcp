# 🚀 Quick Fix for Armada Frontend

## One-Line Fix Command

Copy and paste this into your terminal:

```bash
cd /path/to/armada-frontend && curl -sSL https://raw.githubusercontent.com/hypnoticproductions/armada-mcp/claude/error-handling-review-ruUhj/fix-armada-frontend.sh | bash
```

Or if you have the armada-mcp repo locally:

```bash
cd /path/to/armada-frontend && bash /path/to/armada-mcp/fix-armada-frontend.sh
```

---

## What This Fixes

**Error:**
```
Module not found: Can't resolve '@/lib/utils'
./components/ui/button.tsx
./components/ui/card.tsx
```

**Solution:**
- ✅ Creates `lib/utils.ts` with the `cn()` utility
- ✅ Installs `clsx` and `tailwind-merge`
- ✅ Verifies tsconfig.json
- ✅ Tests the build
- ✅ Shows you exactly what to commit

---

## Manual Steps (if preferred)

### 1. Navigate to armada-frontend

```bash
cd /path/to/armada-frontend
```

### 2. Create lib/utils.ts

```bash
mkdir -p lib
cat > lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF
```

### 3. Install dependencies

```bash
npm install clsx tailwind-merge
```

### 4. Test build

```bash
npm run build
```

### 5. Commit and push

```bash
git add lib/utils.ts package.json package-lock.json
git commit -m "fix: Add missing utils file for shadcn-ui components"
git push origin main
```

---

## Expected Output

When the script runs successfully, you'll see:

```
╔════════════════════════════════════════════════════════════════╗
║                    ✅ BUILD SUCCESSFUL!                        ║
╚════════════════════════════════════════════════════════════════╝

All fixes applied successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Next Steps: Commit and Push
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run these commands to deploy:

git add lib/utils.ts package.json package-lock.json
git commit -m 'fix: Add missing utils file for shadcn-ui components'
git push origin main

Vercel will automatically deploy when you push!
```

---

## Troubleshooting

### Script says "package.json not found"

You're not in the armada-frontend directory. Run:
```bash
cd /path/to/armada-frontend
```

### Build still fails after running script

Check if you're using the `src/` directory structure:
- If yes: Make sure the script created `src/lib/utils.ts`
- Verify your `tsconfig.json` has: `"@/*": ["./src/*"]`

### Import errors persist

Check your component imports match your tsconfig:
```typescript
// Should be:
import { cn } from "@/lib/utils"

// Not:
import { cn } from "../lib/utils"
import { cn } from "lib/utils"
```

---

## Files Created

- `lib/utils.ts` - The CN utility function
- Updated `package.json` - Added clsx and tailwind-merge
- Updated `package-lock.json` - Dependency lock file

---

## After Pushing

Vercel will:
1. Detect your push to main
2. Trigger a new build
3. Build will succeed ✅
4. Deploy to production 🚀

Check your Vercel dashboard to see the deployment progress!
