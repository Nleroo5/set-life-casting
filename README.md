# Set Life Casting Website

A modern, high-performance website for Set Life Casting LLC - Atlanta's premier extras casting company.

## 🎬 About

This website is built with Next.js 14+, React 18+, TypeScript, and Tailwind CSS, featuring:

- **Fast Loading**: Optimized for Core Web Vitals with Next.js App Router and Server Components
- **Smooth Animations**: Framer Motion for professional micro-interactions
- **Real-time Casting Updates**: Firebase Firestore integration for live casting status
- **Mobile-First Design**: Fully responsive across all devices
- **SEO Optimized**: Proper metadata, schema markup, and semantic HTML

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Backend**: Firebase (Firestore, Storage)
- **Deployment**: Vercel (automatic deployments from GitHub)
- **UI Components**: Radix UI primitives

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd set-life-casting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

   Then fill in your Firebase credentials and site info.

4. **Set up Firebase**

   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Storage (for future image uploads)
   - Create collections: `castings`, `newsletter`, `contact-submissions`

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗂️ Project Structure

```
set-life-casting/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── about/             # About page
│   │   ├── services/          # Services page
│   │   ├── resources/         # Talent resources page
│   │   ├── faq/              # FAQ page
│   │   ├── contact/          # Contact page
│   │   ├── layout.tsx        # Root layout with metadata
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css       # Global styles & Tailwind config
│   ├── components/
│   │   ├── layout/           # Header, Footer, Navigation
│   │   ├── sections/         # Page sections (Hero, Features, etc.)
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── firebase.ts       # Firebase configuration
│   │   └── utils.ts          # Utility functions
│   └── types/
│       └── casting.ts        # TypeScript type definitions
├── public/
│   └── images/               # Static images
└── .env.local.example        # Environment variables template
```

## 🎨 Design System

### Colors
- **Primary**: `#e0e2ed` (Light gray-blue)
- **Secondary**: `#484955` (Dark gray)
- **Accent**: `#5f65c4` (Purple-blue)

### Animations
All animations use Framer Motion for smooth, performant interactions.

## 📄 Pages

1. **Home** (`/`) - Hero, casting status, features, portfolio, CTA, newsletter
2. **About** (`/about`) - Company story, values, coverage area
3. **Services** (`/services`) - Detailed service offerings and process
4. **Resources** (`/resources`) - Photo guidelines, set etiquette, talent info
5. **FAQ** (`/faq`) - Frequently asked questions with accordion UI
6. **Contact** (`/contact`) - Contact form and information

## 🔥 Firebase Setup

### Firestore Collections

**castings**: For managing casting calls
**newsletter**: For email subscribers
**contact-submissions**: For contact form submissions

See `.env.local.example` for required environment variables.

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

The site will auto-deploy on every push to main.

## 🎯 Key Features

- Real-time casting status widget
- Newsletter signup
- Contact form with Firebase
- Smooth animations
- SEO optimized
- Mobile responsive
- Accessibility compliant

## 📊 Performance

Target: 95+ Lighthouse performance score with optimized images, code splitting, and Server Components.

## 📞 Support

For questions or issues:
- **Email**: contact@setlifecasting.com
- **Facebook**: [@setlifecasting](https://www.facebook.com/setlifecasting)

---

Built with ❤️ using Claude Code
