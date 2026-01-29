# Firebase Password Reset Configuration

## ✅ What Changed

Your password reset now uses **Firebase's native system** - no Admin SDK or service account keys required! This bypasses the organization policy restriction and is actually more secure.

---

## 🔧 Required: Configure Firebase Console

Firebase needs to know where to send users when they click the password reset link in their email.

### Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `set-life-casting`
3. Navigate to **Authentication** → **Templates**
4. Click the **pencil icon** next to **"Password reset"**
5. Click **"Customize action URL"**
6. Enter your production URL: `https://your-production-domain.com`
   - For local testing: `http://localhost:3000`
7. Click **Save**

---

## 📧 Customize Email Template (Optional)

You can customize the password reset email to match your branding:

1. In the same **Templates** → **Password reset** page
2. Edit the **Email subject** and **Email body**
3. Available variables:
   - `%LINK%` - The password reset link (required!)
   - `%EMAIL%` - The user's email address
   - `%APP_NAME%` - Your app name

**Example Template:**
```
Subject: Reset Your Password - Set Life Casting

Hi there,

You requested to reset your password for Set Life Casting.

Click the link below to create a new password:
%LINK%

If you didn't request this, you can safely ignore this email.

Thanks,
The Set Life Casting Team
```

---

## 🚀 How It Works Now

### User Flow:
1. User clicks "Forgot Password" on login page
2. Enters their email → clicks "Send Reset Email"
3. Firebase sends email with reset link
4. User clicks link → goes to your custom page: `/auth/reset-password?oobCode=...`
5. User enters new password → password is updated
6. User is redirected to login

### Technical Flow:
- Uses `sendPasswordResetEmail()` - Firebase handles email delivery
- Uses `confirmPasswordReset()` - No Admin SDK needed
- Secure, scalable, and recommended by Firebase

---

## ✅ Benefits of This Approach

1. **No Admin SDK** - Bypasses your organization's service account policy
2. **More Secure** - No service account keys to manage
3. **Reliable** - Firebase's email infrastructure
4. **Customizable** - Full control over the reset page UI
5. **Free** - No additional cost

---

## 🧪 Testing

### Local Testing:
1. Make sure Firebase action URL is set to `http://localhost:3000`
2. Run your app: `npm run dev`
3. Go to login page → "Forgot Password"
4. Enter your email → check your inbox
5. Click link → should go to `http://localhost:3000/auth/reset-password?oobCode=...`
6. Enter new password → should work!

### Production Testing:
1. Update Firebase action URL to your production domain
2. Deploy your app
3. Test the same flow

---

## 🆘 Troubleshooting

**"Invalid reset link" error:**
- Make sure you set the action URL in Firebase Console
- Check that the `oobCode` parameter is in the URL
- Reset links expire after 1 hour

**Email not arriving:**
- Check spam folder
- Verify email template is enabled in Firebase Console
- Check Firebase Console → Authentication → Templates → Password reset

**Wrong redirect URL:**
- Double-check the action URL setting in Firebase Console
- Make sure it matches your production domain exactly

---

## 🎉 You're All Set!

No more service account key issues. Firebase handles everything securely. Your custom reset page gives users a branded experience while Firebase does the heavy lifting.
