# Skins Builder - Ethnicity Codes & Branding Update

## Overview
The skins builder now uses industry-standard ethnicity codes and professional branded Excel exports to streamline production documentation.

---

## Ethnicity Codes

### Standard Codes Used

The system automatically converts ethnicity values to single-letter codes:

| Code | Ethnicity |
|------|-----------|
| **C** | Caucasian / White |
| **A** | Asian |
| **AA** | African American / Black |
| **H** | Hispanic / Latino / Latina |
| **O** | Other (any ethnicity not listed above) |

### How It Works

**In the UI:**
- Shows both code AND full name: `C (Caucasian)`
- Example: `H (Hispanic, Latino)`
- If multiple ethnicities, shows first one as code: `AA (African American, Hispanic)`

**In Excel Export:**
- Shows ONLY the code: `C`, `A`, `AA`, `H`, or `O`
- Keeps the skin compact and professional
- Industry-standard format for production sheets

### Automatic Conversion

The system automatically detects ethnicity from:
- `profile.physical.ethnicity` (new format)
- `profile.appearance.ethnicity` (old format - backwards compatible)

**Conversion Logic:**
```typescript
Caucasian, White → C
Asian → A
African American, Black → AA
Hispanic, Latino, Latina → H
All others → O
```

**Case Insensitive:** Works with any capitalization (e.g., "caucasian", "CAUCASIAN", "Caucasian")

---

## Excel Branding

### Professional Styling

The Excel export now includes:

#### 1. **Purple Header (Production Title)**
- Full-width purple banner at top (A1:J1)
- Production title in white text, large and bold
- 50px height for prominence
- Only purple element in the entire sheet

#### 2. **Logo at Bottom**
- Set Life Casting logo at bottom of sheet
- White background (clean and professional)
- 180px x 80px logo size
- Centered horizontally
- Automatically fetched via API proxy (no CORS issues)
- Fallback: "SET LIFE CASTING" text if logo fails to load

#### 3. **Clean Professional Layout**
- Gray column headers (#484955) with white text
- Simple production information section (shoot date, production day, casting info)
- No background colors in data rows (clean white)
- Consistent thin borders throughout
- Auto-sized columns for optimal viewing
- Optimized row heights (50px header, 25px data rows, 80px logo area)

### Layout Details

**Row 1:** Production Title Header
- Full-width purple banner (A1:J1)
- White text, large and bold (20pt)
- 50px height
- Only purple element in sheet

**Row 2:** Shoot Date & Production Day
- Simple layout with bold labels
- No background colors

**Row 3:** Casting Company, Associate, and Phone
- Clean formatting
- Bold labels for easy reading

**Row 5:** Column Headers
- Gray background (#484955) with white text
- Bold, centered text
- 25px height

### Data Section

**Data Rows:**
- Clean white background (no alternating colors)
- Simple and easy to read
- Professional appearance

**Centered Columns:**
- No. (Column 1)
- Sex (Column 5)
- Ethnicity (Column 6)

**All Cells:**
- Consistent thin borders
- 25px row height
- Professional spacing

**Bottom Logo:**
- White background
- 80px height
- Logo centered horizontally

---

## Benefits

### For Casting Directors
✅ **Faster Review** - Ethnicity codes are quick to scan
✅ **Professional Appearance** - Clean layout with subtle branding
✅ **Industry Standard** - Codes match production industry norms
✅ **Print Ready** - Optimized for printing (minimal ink usage)

### For Production Teams
✅ **Easy to Read** - Clean white rows with clear headers
✅ **Compact Format** - Codes save space on printed sheets
✅ **Professional Look** - Simple, elegant design for client delivery
✅ **Subtle Branding** - Purple header and bottom logo

### For Talent
✅ **Accurate Data** - Pulled directly from their profiles
✅ **Privacy Friendly** - Codes are less conspicuous than full ethnicity labels

---

## Usage Examples

### Example 1: Creating a Branded Skin

1. **Fill Production Info:**
   ```
   Production Title: Atlanta Film Day 1
   Shoot Date: 2026-02-15
   Production Day: 1 of 3
   Casting Company: Set Life Casting
   Casting Associate: John Smith
   Associate Phone: (404) 555-1234
   ```

2. **Add Roles:**
   - Lead Actor (Jane Doe - Caucasian, Female)
     - **UI Shows:** `C (Caucasian)`
   - Supporting Actor (Kim Lee - Asian, Male)
     - **UI Shows:** `A (Asian)`
   - Background Actor (Marcus Johnson - African American, Male)
     - **UI Shows:** `AA (African American)`

3. **Export to Excel:**
   - Purple production title banner at top
   - Gray column headers with white text
   - Ethnicity column shows: `C`, `A`, `AA`
   - Clean white data rows
   - Logo at bottom on white background
   - Professional clean appearance

### Example 2: Ethnicity Code Display

**Profile Has:** `["Hispanic", "White"]`
- **UI Shows:** `H (Hispanic, White)`
- **Excel Shows:** `H`

**Profile Has:** `"Asian"`
- **UI Shows:** `A (Asian)`
- **Excel Shows:** `A`

**Profile Has:** `"Middle Eastern"`
- **UI Shows:** `O (Middle Eastern)`
- **Excel Shows:** `O`

---

## Technical Implementation

### Functions Added

**`getEthnicityCode()`** (Line ~223)
```typescript
function getEthnicityCode(ethnicity: string | string[] | undefined): string {
  // Converts ethnicity to code: C, A, AA, H, O
  // Handles arrays, strings, or undefined
  // Case insensitive matching
}
```

### Excel Styling

**Colors Used:**
```typescript
const brandPurple = "5F65C4"; // Production title header only
const brandGray = "484955";   // Column headers
```

**Header Styling:**
```typescript
// Production Title: Purple background (#5F65C4), white text, full width
// Column Headers: Gray background (#484955), white text
// Data Rows: White background (no alternating colors)
```

**Logo Integration:**
```typescript
// Fetches logo via API proxy (/api/logo)
// Adds as image to workbook
// Positions at bottom center on white background
// 180px x 80px size
```

---

## Troubleshooting

### Logo Not Appearing

**Problem:** Logo fails to load in Excel export

**Solutions:**
1. Check internet connection (logo fetched from Firebase)
2. Verify logo URL is accessible
3. Check browser console for errors
4. Logo load errors are logged but won't stop export

### Wrong Ethnicity Code

**Problem:** Code doesn't match expected ethnicity

**Solutions:**
1. Check talent's profile at `/profile/create`
2. Verify ethnicity is spelled correctly
3. Run migration scripts to update booking snapshots
4. Check browser console logs for ethnicity data

**Common Misspellings:**
- "Caucasion" → Should be "Caucasian"
- "Hispantic" → Should be "Hispanic"

### Excel Formatting Issues

**Problem:** Colors or styling don't appear

**Solutions:**
1. Open in Microsoft Excel or Google Sheets (not Numbers)
2. Ensure Excel version supports XLSX format
3. Try downloading fresh copy
4. Check if file was modified after export

---

## Future Enhancements

### Potential Additions:
- **Custom Ethnicity Codes** - Allow admins to configure codes
- **Code Legend** - Add legend to Excel footer explaining codes
- **Multiple Ethnicities** - Show all ethnicity codes (e.g., "C/H")
- **Color Coding** - Use different colors per role type
- **QR Codes** - Add QR codes linking to talent profiles
- **Watermarks** - Optional "CONFIDENTIAL" watermark
- **Multi-page Support** - Automatic page breaks for large casts

---

## Related Documentation

- [Skins Builder Guide](SKINS_BUILDER_GUIDE.md) - Complete usage guide
- [Skins Bug Fix](SKINS_BUG_FIX.md) - Booking status bug documentation
- [Admin Guide](ADMIN_GUIDE.md) - Full admin features

---

## Changelog

### v2.1 - Simplified Clean Design (2026-01-28)

**Added:**
- ✅ Ethnicity codes (C, A, AA, H, O)
- ✅ Set Life Casting logo at bottom of Excel sheet
- ✅ Purple production title header (only purple element)
- ✅ API proxy for logo loading (fixes CORS)
- ✅ Clean white data rows (no alternating colors)
- ✅ Gray column headers
- ✅ Professional minimalist design

**Changed:**
- Ethnicity column shows codes instead of full names in Excel
- UI shows both code and full name for clarity
- Simplified branding: purple only in production title
- Logo moved from top to bottom with white background
- Removed alternating row colors for cleaner look
- Column headers changed from purple to gray

**Technical:**
- Added `getEthnicityCode()` helper function
- Created `/api/logo` route to proxy logo and bypass CORS
- Integrated ExcelJS image support for logo
- Simplified cell styling (removed excessive backgrounds)
- Improved row heights and column widths

---

## Support

If you encounter issues:
1. Check browser console for error messages (F12)
2. Verify talent profiles have ethnicity data
3. Test with a fresh export
4. Contact technical support

**Note:** Ethnicity codes are automatically applied. No manual configuration needed.
