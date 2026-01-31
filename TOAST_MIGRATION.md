# Toast Notification Migration Guide

## ✅ Setup Complete

Toast notification library (`react-hot-toast`) is installed and configured.

- ✓ Library installed: `react-hot-toast@2.4.1`
- ✓ Utility created: `src/lib/utils/toast.ts`
- ✓ Toaster component added to: `src/app/layout.tsx`

---

## 📋 Migration Pattern

### Before (alert):
```typescript
alert("Profile created successfully!");
```

### After (toast):
```typescript
import { showToast } from '@/lib/utils/toast';

showToast.success("Profile created successfully!");
```

---

## 🔄 Replacement Types

### Success Messages
```typescript
// OLD
alert("Booking confirmed successfully");

// NEW
showToast.success("Booking confirmed successfully");
```

### Error Messages
```typescript
// OLD
alert("Failed to delete role");

// NEW
showToast.error("Failed to delete role");
```

### Warning Messages
```typescript
// OLD
alert("Please select a project first");

// NEW
showToast.warning("Please select a project first");
```

### Info Messages
```typescript
// OLD
alert("Role updated successfully");

// NEW
showToast.info("Role updated successfully");
```

---

## 📁 Files Requiring Migration (50 total)

### High Priority (Admin Pages - 31 alerts)

1. **src/app/admin/casting/page.tsx** (15 alerts)
   - Lines: 226, 237, 248, 280, 298, 309, 320, 333, 338, 822, 828, 852, 862, 938
   - Add import: `import { showToast } from '@/lib/utils/toast';`
   - Replace patterns:
     - Success: bookings, role creation, updates
     - Errors: deletions, validation failures

2. **src/app/admin/submissions/page.tsx** (7 alerts)
   - Lines: 297, 336, 339, 359, 422, 453, 468, 471
   - Mostly confirmation and error messages

3. **src/app/admin/archive/page.tsx** (5 alerts)
   - Lines: 173, 256, 267, 290, 300
   - Archive operations and validations

4. **src/app/admin/skins/page.tsx** (5 alerts)
   - Lines: 167, 189, 197, 254, 466
   - Export and data operations

5. **src/app/admin/repair-data/page.tsx** (4 alerts)
   - Lines: 140, 169, 227, 240
   - Data repair confirmations

6. **src/app/admin/talent/[userId]/page.tsx** (4 alerts)
   - Lines: 191, 198, 219, 242
   - Profile operations

### Medium Priority (User Pages - 14 alerts)

7. **src/app/profile/create/page.tsx** (5 alerts)
   - Lines: 213, 226, 237, 244, 313
   - Email verification, photo validation, submission errors

8. **src/app/casting/submit/[roleId]/page.tsx** (3 alerts)
   - Lines: 98, 177, 263
   - Submission validations

9. **src/components/casting/steps/PhotosStep.tsx** (1 alert)
   - Line: 165
   - Upload failure

10. **src/components/casting/steps/ReviewStep.tsx** (1 alert)
    - Line: 59
    - Submission failure

---

## 🤖 Automated Migration Script

You can use this bash script to automatically replace alerts:

```bash
#!/bin/bash

# Files to process
FILES=(
  "src/app/admin/casting/page.tsx"
  "src/app/admin/submissions/page.tsx"
  "src/app/admin/archive/page.tsx"
  "src/app/admin/skins/page.tsx"
  "src/app/admin/repair-data/page.tsx"
  "src/app/admin/talent/[userId]/page.tsx"
  "src/app/profile/create/page.tsx"
  "src/app/casting/submit/[roleId]/page.tsx"
  "src/components/casting/steps/PhotosStep.tsx"
  "src/components/casting/steps/ReviewStep.tsx"
)

for file in "${FILES[@]}"; do
  # Add import if not present
  if ! grep -q "showToast" "$file"; then
    # Add after other imports (line 10-20 typically)
    sed -i '' '/^import.*from/a\
import { showToast } from '\''@/lib/utils/toast'\'';
' "$file"
  fi

  # Replace success alerts
  sed -i '' 's/alert(\(".*successfully.*"\))/showToast.success(\1)/g' "$file"
  sed -i '' 's/alert(\(".*created.*"\))/showToast.success(\1)/g' "$file"
  sed -i '' 's/alert(\(".*confirmed.*"\))/showToast.success(\1)/g' "$file"
  sed -i '' 's/alert(\(".*updated.*"\))/showToast.success(\1)/g' "$file"

  # Replace error alerts
  sed -i '' 's/alert(\(".*[Ff]ailed.*"\))/showToast.error(\1)/g' "$file"
  sed -i '' 's/alert(\(".*error.*"\))/showToast.error(\1)/g' "$file"
  sed -i '' 's/alert(\(".*cannot.*"\))/showToast.error(\1)/g' "$file"
  sed -i '' 's/alert(\(".*required.*"\))/showToast.error(\1)/g' "$file"

  # Replace warning alerts
  sed -i '' 's/alert(\(".*[Pp]lease.*"\))/showToast.warning(\1)/g' "$file"
  sed -i '' 's/alert(\(".*must.*"\))/showToast.warning(\1)/g' "$file"

  echo "✓ Processed $file"
done

echo "✅ Migration complete! Review changes before committing."
```

---

## ✅ Manual Verification Steps

After migration:

1. **Check Imports**
   ```bash
   grep -l "alert(" src/**/*.tsx | xargs grep -L "showToast"
   # Should return nothing if all files have import
   ```

2. **Verify Remaining Alerts**
   ```bash
   grep -r "alert(" src/ --include="*.tsx" --include="*.ts" | wc -l
   # Should be 0 after migration
   ```

3. **Test Each Flow**
   - ✓ Profile creation (all validation messages)
   - ✓ Admin casting operations (create, update, delete)
   - ✓ Submission management
   - ✓ Archive operations
   - ✓ Data repair tools

4. **Check Toast Appearance**
   - Success toasts: Green background
   - Error toasts: Red background
   - Warning toasts: Orange background with ⚠️ icon
   - Should appear top-right corner
   - Should auto-dismiss after 4-5 seconds

---

## 🎨 Custom Toast Styling

If you need to customize toast appearance, edit `src/lib/utils/toast.ts`:

```typescript
// Example: Change position
position: 'bottom-center',

// Example: Change duration
duration: 3000, // 3 seconds

// Example: Custom styling
style: {
  background: '#your-color',
  color: '#fff',
  padding: '16px',
  borderRadius: '8px',
}
```

---

## 📊 Migration Progress Tracker

- [ ] admin/casting/page.tsx (15 alerts)
- [ ] admin/submissions/page.tsx (7 alerts)
- [ ] admin/archive/page.tsx (5 alerts)
- [ ] admin/skins/page.tsx (5 alerts)
- [ ] profile/create/page.tsx (5 alerts)
- [ ] admin/repair-data/page.tsx (4 alerts)
- [ ] admin/talent/[userId]/page.tsx (4 alerts)
- [ ] casting/submit/[roleId]/page.tsx (3 alerts)
- [ ] PhotosStep.tsx (1 alert)
- [ ] ReviewStep.tsx (1 alert)

**Total**: 0/50 migrated

---

## 🐛 Common Issues

### Toast not appearing?
- Check browser console for errors
- Verify `<Toaster />` is in layout.tsx
- Ensure import is correct: `import { showToast } from '@/lib/utils/toast'`

### Multiple toasts stacking?
- Use `showToast.dismissAll()` before showing new toast
- Or set a unique toast ID

### Toast dismissed too quickly?
- Increase `duration` in toast.ts configuration
- Errors have 5000ms, others have 4000ms by default

---

**Created**: 2026-01-31
**Status**: Ready for migration
**Estimated Time**: 30-45 minutes for all 50 replacements
