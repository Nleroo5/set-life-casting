# Skins Builder Bug Fix

## Problem
When trying to add roles to the skin, the system showed "No talent booked for this role" even though talent was actually booked.

## Root Cause
The bug was in `/src/app/admin/skins/page.tsx` line 143:

```typescript
// ❌ WRONG - "booked" is NOT a valid Booking status
where("status", "==", "booked")
```

### Why This Failed
There are TWO different "status" fields in the system:

1. **Project.status** - Can be: `"booking" | "booked" | "archived"`
2. **Booking.status** - Can be: `"pending" | "confirmed" | "tentative" | "cancelled" | "completed"`

The skins page was querying for `status == "booked"`, but that's a **Project status**, not a **Booking status**!

When bookings are created (see `/src/lib/firebase/bookings.ts` line 74), the default status is `"pending"`:

```typescript
status: additionalData?.status || "pending"
```

So the query was looking for a status value that doesn't exist in bookings, which is why it returned no results.

## The Fix

**File:** `/src/app/admin/skins/page.tsx`

**Line 140-161:** Changed the fetchBookings function to:

```typescript
async function fetchBookings() {
  if (!selectedProjectId) return;

  try {
    // Fetch all bookings for the project
    // Note: Booking status values are "pending", "confirmed", "tentative", "cancelled", "completed"
    // NOT "booked" - that's a project/role status
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("projectId", "==", selectedProjectId)
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookingsList = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];

    // Filter out cancelled bookings
    const activeBookings = bookingsList.filter(b => b.status !== "cancelled");

    console.log(`✅ Fetched ${activeBookings.length} active bookings for project`);
    setBookings(activeBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
}
```

**Key Changes:**
1. ✅ Removed the incorrect `where("status", "==", "booked")` filter
2. ✅ Fetch ALL bookings for the project
3. ✅ Filter out cancelled bookings in code
4. ✅ Added logging for debugging

## Additional Improvements

Added extensive debugging to `addRoleToSkin()` function (lines 163-211):

```typescript
console.log("🎬 Adding role to skin:", selectedRoleId);
console.log("📋 Available bookings:", bookings.length);
console.log("📋 Bookings roleIds:", bookings.map(b => `${b.roleId} (${b.talentProfile?.basicInfo?.firstName})`));
```

This will help diagnose any future issues by showing:
- Which role is being added
- How many bookings are available
- What roleIds exist in the bookings
- Whether the role and booking are found

## How to Verify the Fix

1. **Go to Admin → Submissions**
   - Select a project
   - Book talent for at least one role
   - Verify the "Booked" badge appears

2. **Go to Admin → Skins**
   - Select the same project
   - Open browser console (F12)
   - You should see: `✅ Fetched X active bookings for project`

3. **Add a Role:**
   - Select a role that has booked talent
   - Click "Add Role"
   - Should see console logs showing:
     ```
     🎬 Adding role to skin: [roleId]
     📋 Available bookings: 1
     ✅ Role found: [Role Name]
     ✅ Booking found: [Talent Name]
     ✅ Role added to skin successfully
     ```
   - Role card should appear with talent information auto-filled

4. **Try to Add Unbooked Role:**
   - Select a role without booked talent
   - Click "Add Role"
   - Should see clear error: "No talent booked for this role. Please book talent from the Submissions page first."

## Booking Status Reference

For future reference, here are the valid status values:

### Booking.status (BookingStatus)
- `"pending"` - Booked but not yet notified (DEFAULT when created)
- `"confirmed"` - Talent confirmed they can do it
- `"tentative"` - Penciled in, not yet confirmed
- `"cancelled"` - Booking was cancelled
- `"completed"` - Job completed

### Project.status
- `"booking"` - Currently taking submissions
- `"booked"` - All roles filled
- `"archived"` - Project completed/archived

### Role.bookingStatus
- `"booking"` - Still looking for talent
- `"booked"` - Role filled

## Testing Checklist

- [x] Fixed incorrect status query
- [x] Added active booking filter (excludes cancelled)
- [x] Added debugging logs
- [x] Improved error messages
- [x] Tested compilation (successful)
- [ ] Manual test: Book talent and add to skin
- [ ] Manual test: Try to add unbooked role
- [ ] Manual test: Add multiple roles
- [ ] Manual test: Export to Excel

## Related Files

- `/src/app/admin/skins/page.tsx` - Skins builder interface (FIXED)
- `/src/lib/firebase/bookings.ts` - Booking operations
- `/src/types/booking.ts` - Type definitions
- `/src/app/admin/submissions/page.tsx` - Where bookings are created

## Status

✅ **FIXED** - Ready for testing

The bug has been identified and corrected. The skins builder should now correctly detect booked talent and allow adding roles to the skin.
