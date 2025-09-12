# StriveTrack Cloud Migration Guide

This guide walks you through migrating StriveTrack from Cloudflare Pages to Vercel + Supabase for persistent cloud storage.

## 🎯 Migration Overview

**From:** Cloudflare Pages + D1 + R2 + localStorage  
**To:** Vercel + Supabase + Progressive Web App

**Benefits:**
- ✅ Reliable deployment (no more deployment failures)
- ✅ Persistent cloud storage (data survives browser clearing)
- ✅ User authentication with Supabase Auth
- ✅ Media file storage for progress photos/videos
- ✅ Offline-first hybrid storage with sync
- ✅ Real-time data synchronization

## 📋 Prerequisites

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository** - Your code needs to be in a Git repository

## 🗄️ Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project:
   - Project name: `strivetrack`
   - Database password: Choose a strong password
   - Region: Choose closest to your users

### 1.2 Configure Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql` from this project
3. Run the SQL to create all tables, policies, and triggers

### 1.3 Set Up Storage Buckets

The SQL script already creates the storage buckets, but you may need to verify:

1. Go to **Storage** in Supabase dashboard
2. Verify these buckets exist:
   - `avatars` (public)
   - `progress-photos` (public)
   - `workout-videos` (public)
   - `user-media` (public)

### 1.4 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - Project URL (looks like `https://your-project-ref.supabase.co`)
   - API Key (anon/public key)

## 🚀 Step 2: Deploy to Vercel

### 2.1 Prepare Environment Variables

Create `.env` file in your project root:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=StriveTrack
VITE_APP_VERSION=2.0.0
```

### 2.2 Deploy to Vercel

**Option A: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy the project
vercel

# Follow prompts:
# - What's your project directory? ./
# - Link to existing project? No
# - What's your project name? strivetrack
# - In which directory is your code located? ./
```

**Option B: Via GitHub Integration**

1. Push your code to GitHub
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `public`
   - Install Command: `npm install`

### 2.3 Set Environment Variables in Vercel

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add each environment variable:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_APP_NAME`: StriveTrack
   - `VITE_APP_VERSION`: 2.0.0

### 2.4 Configure Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain or use the provided `.vercel.app` domain

## 🔄 Step 3: Test Cloud Functionality

### 3.1 Test User Authentication

1. Visit your deployed site
2. Create a new account
3. Verify you receive a confirmation email
4. Sign in with your credentials
5. Check that user profile is created in Supabase

### 3.2 Test Habit Management

1. Create a new habit
2. Complete the habit
3. Verify the habit appears in Supabase `habits` table
4. Verify completion appears in `habit_completions` table
5. Check that points are updated in user profile

### 3.3 Test Offline Functionality

1. Go offline (disable network)
2. Create habits and complete them
3. Go back online
4. Verify data syncs to cloud
5. Check sync status indicator

### 3.4 Test Media Upload

1. Go to Progress section
2. Upload a progress photo
3. Verify file appears in Supabase Storage
4. Verify metadata in `progress_photos` table

## 📊 Step 4: Data Migration (If Needed)

If you have existing data in localStorage from the old app:

### 4.1 Export Existing Data

Add this to browser console on old app:

```javascript
// Export habits
const habits = JSON.parse(localStorage.getItem('strivetrack_habits') || '[]');
const completions = JSON.parse(localStorage.getItem('strivetrack_completions') || '{}');

console.log('Habits:', JSON.stringify(habits, null, 2));
console.log('Completions:', JSON.stringify(completions, null, 2));

// Save to file
const data = { habits, completions };
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'strivetrack-backup.json';
a.click();
```

### 4.2 Import to New App

1. Create account in new app
2. Use browser developer tools
3. Call import functions (to be implemented)

## 🔧 Step 5: Configuration & Optimization

### 5.1 Configure PWA Settings

The app is already configured as a Progressive Web App:

- `manifest.json` for app installation
- Service worker for offline functionality
- App icons and splash screens

### 5.2 Performance Optimization

- Images are automatically optimized by Vercel
- Supabase provides global CDN for file storage
- App uses lazy loading and efficient state management

### 5.3 Security Configuration

- All sensitive data is server-side in Supabase
- Row Level Security (RLS) protects user data
- API keys are properly configured for client-side use

## 🛠️ Step 6: Ongoing Maintenance

### 6.1 Monitor Usage

**Supabase Dashboard:**
- Database usage and performance
- Storage usage
- Authentication metrics
- API usage

**Vercel Dashboard:**
- Deployment status
- Performance metrics
- Error logging

### 6.2 Backup Strategy

**Automatic Backups:**
- Supabase automatically backs up your database
- Point-in-time recovery available

**Manual Backups:**
- Use Supabase CLI to export data
- Store backups in separate location

### 6.3 Scaling Considerations

**Database Scaling:**
- Supabase Pro tier for higher limits
- Connection pooling for performance
- Read replicas for global performance

**Storage Scaling:**
- Supabase Storage scales automatically
- CDN for global file delivery
- Image optimization and resizing

## 🚨 Troubleshooting

### Common Issues

**1. Environment Variables Not Working**
```bash
# Ensure variables start with VITE_ for client-side access
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**2. CORS Errors**
- Supabase automatically handles CORS
- Ensure you're using the correct project URL

**3. Authentication Issues**
- Check email confirmation settings in Supabase Auth
- Verify redirect URLs match your domain

**4. Database Permission Errors**
- Check Row Level Security policies
- Ensure user is authenticated before database operations

**5. File Upload Issues**
- Verify storage bucket policies
- Check file size and type restrictions
- Ensure user has upload permissions

### Debug Tools

**Browser Console:**
```javascript
// Debug authentication
window.striveTrack.authService.getUser()

// Debug sync status
window.striveTrack.syncService.getSyncStatus()

// Debug habits
window.debugHabits()

// Full debug report
window.debugStriveTrack()
```

**Supabase Logs:**
- Go to Logs section in Supabase dashboard
- Monitor API calls and errors
- Check authentication events

## 📈 Success Metrics

Your migration is successful when:

- ✅ Users can sign up and sign in reliably
- ✅ Habits persist across browser sessions/devices
- ✅ Data syncs between online/offline modes
- ✅ Media files upload and display correctly
- ✅ No deployment failures (unlike Cloudflare Pages)
- ✅ App works as PWA (installable on mobile)

## 🎉 Next Steps

After successful migration:

1. **Add Advanced Features:**
   - Real-time habit sharing
   - Social features and leaderboards
   - Advanced analytics and insights
   - Integration with fitness devices

2. **Enhance Performance:**
   - Implement caching strategies
   - Add performance monitoring
   - Optimize for mobile performance

3. **Scale and Grow:**
   - Add team/group functionality
   - Implement premium features
   - Add integrations with other fitness apps

## 📞 Support

If you encounter issues during migration:

1. Check the troubleshooting section above
2. Review Supabase and Vercel documentation
3. Check the debug tools and console logs
4. Verify all environment variables are set correctly

---

**Migration Checklist:**
- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Storage buckets configured
- [ ] Environment variables set
- [ ] Vercel deployment successful
- [ ] Authentication tested
- [ ] Habit CRUD operations tested
- [ ] Offline sync tested
- [ ] Media upload tested
- [ ] PWA functionality verified

The migration provides a much more reliable and scalable foundation for StriveTrack with persistent cloud storage that users can trust! 🚀