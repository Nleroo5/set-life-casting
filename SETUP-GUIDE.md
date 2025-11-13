# 🚀 Setup Guide for Set Life Casting Website

Hi! This guide will walk you through getting your new website up and running. Don't worry - it's easier than it looks!

## ✅ What You Have

Your new website includes:
- ✅ Modern, fast-loading design
- ✅ Real-time casting status system
- ✅ Newsletter signup
- ✅ Contact form
- ✅ All pages (Home, About, Services, Resources, FAQ, Contact)
- ✅ Mobile-responsive design
- ✅ SEO optimized

## 🔧 Quick Setup (30 minutes)

### Step 1: Set Up Firebase (10 minutes)

Firebase is free and will store your casting calls, newsletter subscribers, and contact form submissions.

1. **Create a Firebase Account**
   - Go to [https://console.firebase.google.com](https://console.firebase.google.com)
   - Sign in with your Google account
   - Click "Add project"
   - Name it "set-life-casting" (or whatever you want!)
   - You can disable Google Analytics (not needed)

2. **Enable Firestore Database**
   - In your Firebase project, click "Firestore Database" in the left menu
   - Click "Create database"
   - Choose "Start in production mode"
   - Select your region (us-central works fine)
   - Click "Enable"

3. **Set Up Security Rules**
   - In Firestore, click the "Rules" tab
   - Replace the content with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow anyone to read castings
       match /castings/{casting} {
         allow read: if true;
         allow write: if request.auth != null;
       }

       // Allow anyone to subscribe to newsletter
       match /newsletter/{subscriber} {
         allow read: if request.auth != null;
         allow create: if true;
       }

       // Allow anyone to submit contact forms
       match /contact-submissions/{submission} {
         allow read: if request.auth != null;
         allow create: if true;
       }
     }
   }
   ```
   - Click "Publish"

4. **Get Your Firebase Credentials**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Click "Project settings"
   - Scroll down to "Your apps" section
   - Click the web icon `</>`
   - Name your app "Set Life Casting Website"
   - Click "Register app"
   - **SAVE THESE VALUES** - you'll need them in Step 3!

### Step 2: Deploy to Vercel (10 minutes)

Vercel will host your website for free with automatic deployments.

1. **Create GitHub Repository**
   - Go to [https://github.com](https://github.com)
   - Click "New repository"
   - Name it "set-life-casting-website"
   - Make it private (recommended)
   - Don't add README, .gitignore, or license (we already have them)
   - Click "Create repository"

2. **Push Your Code to GitHub**
   - Open Terminal in VS Code
   - Run these commands (replace YOUR-USERNAME with your GitHub username):
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/set-life-casting-website.git
   git add .
   git commit -m "Initial website setup"
   git push -u origin main
   ```

3. **Deploy to Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Click "Sign Up" and use your GitHub account
   - Click "Import Project"
   - Select your "set-life-casting-website" repository
   - Click "Import"
   - **IMPORTANT**: Before clicking Deploy, add Environment Variables:
     - Click "Environment Variables"
     - Add each of these (use your Firebase values from Step 1):
       ```
       NEXT_PUBLIC_FIREBASE_API_KEY = your_api_key
       NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_project_id.firebaseapp.com
       NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_project_id
       NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_project_id.appspot.com
       NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
       NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
       ```
   - Click "Deploy"
   - Wait 2-3 minutes for deployment to complete
   - Click "Visit" to see your live site!

### Step 3: Connect Your Domain (10 minutes)

1. **In Vercel**
   - Go to your project
   - Click "Settings" → "Domains"
   - Type "www.setlifecasting.com"
   - Click "Add"
   - Vercel will show you DNS settings

2. **Update Your Domain DNS**
   - Go to wherever you manage your domain (GoDaddy, Namecheap, etc.)
   - Find DNS settings
   - Add/update the A record and CNAME as Vercel specifies
   - Wait 10-60 minutes for DNS to propagate
   - Your site will be live at www.setlifecasting.com!

## 📝 Managing Your Website

### How to Add a New Casting Call

1. Go to Firebase Console: [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click your project → Firestore Database
3. Click "Start collection" (first time) or just click the `castings` collection
4. Click "Add document"
5. Fill in these fields:

| Field | Type | Example |
|-------|------|---------|
| title | string | "Feature Film - Background Actors Needed" |
| description | string | "Seeking diverse background actors for feature film shooting in Atlanta..." |
| productionType | string | Choose: "film", "tv", "commercial", "music-video", or "other" |
| isOpen | boolean | ✅ true (accepting submissions) or false (booked) |
| postedDate | timestamp | Click "Set to current time" |
| requirements | string | "Ages 18-65, all ethnicities, must be available March 15-20" |
| payRate | string | "$150/day" |
| location | string | "Atlanta, GA" |
| createdAt | timestamp | Click "Set to current time" |
| updatedAt | timestamp | Click "Set to current time" |

6. Click "Save"
7. The casting will appear on your website immediately! ✨

### How to Mark a Casting as BOOKED

1. Go to Firestore Database → `castings` collection
2. Click the casting you want to update
3. Find the `isOpen` field
4. Change it to `false`
5. Optional: Add a `bookingDate` field (timestamp) set to current time
6. Click "Update"
7. It will show as BOOKED on your website! 🎬

### How to View Newsletter Subscribers

1. Go to Firestore Database
2. Click the `newsletter` collection
3. You'll see all email addresses that signed up
4. Export them to use in your email marketing tool (Mailchimp, Constant Contact, etc.)

### How to View Contact Form Submissions

1. Go to Firestore Database
2. Click the `contact-submissions` collection
3. You'll see all messages, with:
   - Name, email, phone
   - Type (talent/production/general)
   - Subject and message
   - Submission date

### How to Update Content

**Easy Way**: Edit the page files directly in VS Code:
- Home page: `src/app/page.tsx`
- About page: `src/app/about/page.tsx`
- Services: `src/app/services/page.tsx`
- Resources: `src/app/resources/page.tsx`
- FAQ: `src/app/faq/page.tsx`
- Contact: `src/app/contact/page.tsx`

After editing:
```bash
git add .
git commit -m "Updated content"
git push
```

Vercel will automatically deploy your changes in ~2 minutes!

## 🎨 Customization Tips

### Update Colors

Edit `src/app/globals.css` and change these values:
```css
--primary: #e0e2ed;     /* Light background color */
--secondary: #484955;   /* Text color */
--accent: #5f65c4;      /* Buttons and links */
```

### Update Contact Info

1. Edit `src/components/layout/Footer.tsx` - update email, phone, social links
2. Edit `src/components/layout/Header.tsx` - update navigation
3. Edit `src/app/contact/page.tsx` - update contact information

### Add Movie Posters

1. Add images to `public/images/projects/`
2. Update `src/components/sections/Portfolio.tsx`
3. Replace the placeholder projects with your actual movie posters

## 📱 Social Media Integration

### Facebook Casting Posts

Currently, you need to manually add castings in Firebase. For future automatic integration:

1. Create a Facebook Page Access Token
2. Set up a webhook
3. Create a Cloud Function to sync posts

This is advanced - contact me if you want help setting this up!

## 🐛 Troubleshooting

### "Firebase is not initialized" error
- Make sure you added all environment variables in Vercel
- Redeploy the site after adding variables

### Castings not showing up
- Check Firestore security rules are set correctly
- Make sure `isOpen` is set to `true` (boolean, not string)
- Check browser console for errors (F12 → Console tab)

### Site not loading at domain
- DNS can take up to 24-48 hours to propagate
- Check DNS settings in your domain registrar match Vercel's instructions
- Try clearing browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

## 📞 Need Help?

If you get stuck:
1. Check the README.md file for technical details
2. Review Firebase documentation: [https://firebase.google.com/docs](https://firebase.google.com/docs)
3. Review Vercel documentation: [https://vercel.com/docs](https://vercel.com/docs)
4. Contact me for support!

## 🎉 You're All Set!

Your website is now live and ready to help you cast amazing talent! Here's what to do next:

1. ✅ Add your first casting call in Firebase
2. ✅ Update the About page with your story
3. ✅ Add your actual movie poster images
4. ✅ Update social media links
5. ✅ Share your new website!

---

**Remember**: Every time you push to GitHub, Vercel automatically deploys your changes. No need to manually redeploy!

Love it? Share it! 💜

Questions? Feel free to reach out anytime!
