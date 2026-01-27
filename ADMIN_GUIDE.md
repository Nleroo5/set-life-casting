# Admin Dashboard Guide

## Admin Account Setup

### Credentials
- **Email:** chazlynyu@gmail.com
- **Password:** Setlifecasting123

### First-Time Setup

1. **Create the account:**
   - Navigate to `/signup`
   - Sign up with the admin credentials above

2. **Get Firebase UID:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Navigate to: Authentication → Users
   - Find `chazlynyu@gmail.com` and copy the UID

3. **Set admin role:**
   - Navigate to `/admin-setup` in your app
   - Paste the UID and click "Make Admin"

4. **Security cleanup:**
   ```bash
   rm src/app/admin-setup/page.tsx
   ```

5. **Test:**
   - Log out and log back in
   - You'll be redirected to `/admin` automatically
   - No profile creation required!

## Admin Dashboard Features

### Main Dashboard (`/admin`)
- Overview of admin functions
- Quick actions for common tasks
- Access to:
  - Casting Management
  - Submissions Review

### Casting Management (`/admin/casting`)
**Projects:**
- Create new projects (films, TV, commercials, music videos, events)
- Edit existing projects
- Set project details:
  - Title
  - Type
  - Location
  - Shoot dates
  - Rate (optional)
  - Status (active/archived)

**Roles:**
- Create roles within projects
- Manage role details:
  - Name
  - Description
  - Requirements
  - Booking status (now-booking/booked)

### Submissions Review (`/admin/submissions`)
- View all talent submissions
- Filter by status:
  - All
  - Pending
  - Reviewed
  - Selected
  - Rejected
- View talent profiles:
  - Basic info (name, contact, location)
  - Physical appearance
  - Measurements/sizes
  - Additional details
  - Photos (headshot, full body, additional)
- Update submission status

## Key Differences from Talent Users

| Feature | Admin | Talent |
|---------|-------|--------|
| Dashboard | `/admin` | `/dashboard` |
| Profile Creation | Not required | Required |
| Can Create Projects | ✅ Yes | ❌ No |
| Can Review Submissions | ✅ Yes | ❌ No |
| Can Submit to Roles | ❌ No | ✅ Yes |
| Header Navigation | Shows "Admin" link | Shows "Dashboard" link |

## Implementation Details

### Authentication
- Admin check: `userData.role === "admin"` in Firestore `users` collection
- Auto-redirect on login:
  - Admins → `/admin`
  - Talent → `/dashboard`

### Firestore Structure
```
users/
  {uid}/
    email: string
    displayName: string
    role: "talent" | "admin"
    isGuest: boolean
    createdAt: Date

projects/
  {projectId}/
    title: string
    type: string
    location: string
    shootDates: string
    rate: string (optional)
    status: "active" | "archived"

roles/
  {roleId}/
    projectId: string
    name: string
    description: string
    requirements: string
    bookingStatus: "now-booking" | "booked"

submissions/
  {submissionId}/
    userId: string
    roleId: string
    projectId: string
    roleName: string
    projectTitle: string
    status: "pending" | "reviewed" | "selected" | "rejected"
    submittedAt: Date
    profileData: {full profile snapshot}
```

## Security Notes

1. **Delete `/admin-setup` after first use** - this page allows setting any user as admin
2. **Admin role is stored in Firestore** - can be managed via Firebase Console if needed
3. **Protected routes** - all admin pages check `isAdmin` before rendering
4. **No server-side validation yet** - consider adding Firebase Security Rules to enforce admin-only access to certain collections

## Future Enhancements

Consider adding:
- Dashboard analytics (total projects, submissions, etc.)
- Bulk actions for submissions
- Email notifications when submission status changes
- Export submissions to CSV
- Advanced filtering (by project, date range, etc.)
- Role templates
- Project archiving with confirmation
