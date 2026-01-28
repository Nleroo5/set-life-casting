# Skins Builder Guide

## Overview
The redesigned Skins Builder provides an intuitive interface for creating production skins (talent sheets) with complete production information and detailed role-by-role entry.

## Location
**URL:** `/admin/skins`

## Features

### 1. Production Header Section

Enter all key production details:

- **Production Title** - Auto-filled from selected project (editable)
- **Shoot Date** - Date picker for the shoot
- **Production Day** - Current day number (e.g., "1")
- **Total Days** - Total production days (e.g., "5" for "1 of 5")
- **Casting Company** - Defaults to "Set Life Casting"
- **Casting Associate Name** - Name of the casting associate
- **Associate Phone** - Contact number for the associate

### 2. Project Selection

- **Select Project** dropdown lists all active projects
- When selected:
  - Auto-fills production title
  - Auto-fills shoot date
  - Loads all roles for that project
  - Loads all booked talent

### 3. Add Roles to Skin

**How to Add a Role:**
1. Select a role from the "Select Role" dropdown
2. Dropdown shows: `Role Name - $Rate`
3. Click "Add Role" button

**What Happens:**
- Talent information **automatically populates** from the booking:
  - First Name
  - Last Name
  - Gender
  - Phone
  - Email
- Role rate is displayed
- Role appears in the "Roles in Skin" section

**Features:**
- ✅ Auto-fills all talent information
- ✅ Shows rate from role
- ✅ Prevents duplicate roles
- ✅ Validates booking exists before adding

### 4. Roles in Skin Section

Each added role displays:

**Auto-Filled Information:**
- Role number (#1, #2, etc.)
- Role name
- Rate (green badge)
- Talent name
- Gender
- Phone
- Email

**Editable Fields:**
- **Call Time** - Time picker for talent call time (e.g., "9:00 AM")
- **Notes** - Text field for special instructions

**Actions:**
- **Remove Role** - Delete button (trash icon) removes role from skin

### 5. Export to Excel

**Button:** "Export to Excel" (appears when roles are added)

**Exported File Includes:**

**Header Section:**
- Production title (centered, bold, large)
- Shoot Date
- Production Day (e.g., "1 of 5")
- Casting Company
- Casting Associate name and phone

**Role Data Columns:**
1. **No.** - Sequential numbering
2. **Role** - Role name
3. **Last** - Last name
4. **First** - First name
5. **Sex** - M/F (from gender field)
6. **Ethnicity** - Industry-standard codes: C (Caucasian), A (Asian), AA (African American), H (Hispanic), O (Other)
7. **Phone** - Contact number
8. **Email** - Email address
9. **Call Time** - Entered call time
10. **Notes** - Special notes

**File Format:**
- Excel (.xlsx) format
- Professional branding with Set Life Casting logo
- Brand colors (purple headers, alternating row backgrounds)
- Professional styling with borders and headers
- Auto-sized columns
- Filename: `{Production_Title}_Skin.xlsx`

## Workflow Example

### Creating a Skin for "Atlanta Film Day 1"

1. **Fill Production Info:**
   ```
   Production Title: Atlanta Film
   Shoot Date: 2026-02-15
   Production Day: 1
   Total Days: 3
   Casting Company: Set Life Casting
   Casting Associate: John Smith
   Associate Phone: (404) 555-1234
   ```

2. **Select Project:**
   - Choose "Atlanta Film" from dropdown
   - Production info auto-updates

3. **Add Roles:**
   - Select "Lead Actor - $500/day" → Click "Add Role"
     - Auto-fills: Jane Doe, Female, (555) 123-4567, jane@example.com
     - Enter Call Time: 7:00 AM
     - Add Notes: "Wardrobe fitting at 6:30 AM"

   - Select "Supporting Actor - $300/day" → Click "Add Role"
     - Auto-fills: John Smith, Male, (555) 987-6543, john@example.com
     - Enter Call Time: 8:00 AM
     - Add Notes: "Bring own shoes"

   - Select "Background Actor - $150/day" → Click "Add Role"
     - Auto-fills: Sarah Johnson, Female, (555) 456-7890, sarah@example.com
     - Enter Call Time: 9:00 AM

4. **Review Roles:**
   - Check all information is correct
   - Edit call times or notes if needed
   - Remove any incorrect roles

5. **Export:**
   - Click "Export to Excel"
   - Download: `Atlanta_Film_Skin.xlsx`
   - Open in Excel/Google Sheets
   - Print or email to production team

## Benefits

### For Casting Directors:
✅ **Fast Entry** - Add roles one at a time with auto-filled talent info
✅ **No Manual Data Entry** - All talent information auto-populates
✅ **Flexible** - Edit call times and notes per role
✅ **Professional Output** - Excel export ready for production

### For Production Teams:
✅ **Complete Information** - All production details in one place
✅ **Clear Layout** - Easy to read with role numbers and sections
✅ **Call Times** - Each talent's call time clearly displayed
✅ **Notes** - Special instructions per talent
✅ **Contact Info** - Phone and email for all talent

### For Talent:
✅ **Accurate Information** - Data pulled directly from their profiles
✅ **Clear Communication** - Call times and notes visible
✅ **Professional** - Presented in industry-standard format

## Tips & Best Practices

### 1. Complete Production Info First
Fill out all header fields before adding roles to ensure complete exports.

### 2. Add Roles in Order
Add roles in the order you want them to appear on the skin:
- Leads first
- Supporting roles next
- Background talent last

### 3. Use Descriptive Notes
Examples of good notes:
- "Bring own wardrobe - business casual"
- "Hair and makeup at 6:00 AM"
- "Special dietary requirements - vegan"
- "Stunt rehearsal at 7:30 AM"

### 4. Verify Information
Before exporting:
- Check all names are correct
- Verify call times make sense
- Review contact information
- Confirm rates are accurate

### 5. Export Multiple Times
You can export multiple times if needed:
- Initial call sheet
- Updated version with changes
- Day-of-shoot final version

## Troubleshooting

### "No talent booked for this role"
**Problem:** Trying to add a role that hasn't been booked yet

**Solution:**
1. Go to Admin → Submissions
2. Book talent for that role
3. Return to Skins Builder
4. Try adding the role again

### Missing Gender or Ethnicity
**Problem:** Talent information shows "N/A" for gender or ethnicity

**Solution:**
1. Have talent complete their profile at /profile/create
2. Or run the migration scripts (see SEARCHABLE_PROFILES_IMPLEMENTATION.md)
3. Refresh the page and add the role again

### Role Already in Skin
**Problem:** "This role is already in the skin" alert

**Solution:**
- The role has already been added
- Look in the "Roles in Skin" section
- Remove it if needed, then re-add

### Export Not Working
**Problem:** Excel file doesn't download

**Solution:**
1. Check browser popup blocker settings
2. Try a different browser
3. Check console for errors
4. Ensure at least one role is added

## Future Enhancements

### Planned Features:
- **PDF Export** - Generate PDF version of skin
- **Email Distribution** - Send skin directly to production team
- **Templates** - Save header info as templates
- **Multi-Day Skins** - Create skins for multiple shoot days at once
- **Print View** - Optimized print layout
- **Role Grouping** - Group roles by type (Lead, Supporting, BG)
- **Rate Totals** - Calculate total production costs
- **Availability Check** - Show talent availability status

## Related Documentation

- [Ethnicity Codes & Branding](SKINS_ETHNICITY_CODES.md) - Ethnicity codes and Excel branding details
- [Searchable Profiles Implementation](SEARCHABLE_PROFILES_IMPLEMENTATION.md) - Profile data structure
- [Admin Guide](ADMIN_GUIDE.md) - Complete admin features
- [Booking Guide](ADMIN_GUIDE.md#booking-talent) - How to book talent

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify talent have complete profiles
3. Ensure bookings are confirmed
4. Try refreshing the page
5. Contact technical support

---

**Note:** The old skins interface has been backed up at `src/app/admin/skins/old-page.tsx.backup` for reference.
