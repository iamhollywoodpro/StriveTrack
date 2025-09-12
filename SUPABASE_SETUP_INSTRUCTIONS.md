# 🌤️ StriveTrack Supabase Setup Instructions

## 📋 **Step-by-Step Setup Process**

### **1. Database Schema Setup**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: "StriveTrack App Project" 
3. **Navigate to SQL Editor** (left sidebar)
4. **Create a new query** 
5. **Copy and paste the entire contents** of `supabase-schema.sql`
6. **Click "Run"** to execute the schema

This will create:
- ✅ 11 database tables (users, habits, goals, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for automatic point calculation
- ✅ Functions for business logic

### **2. Storage Buckets Setup**

1. **Navigate to Storage** (left sidebar)
2. **Create these buckets**:

#### **Bucket 1: user-media**
- **Name**: `user-media`
- **Public**: ✅ Make public
- **File size limit**: 50MB
- **Allowed MIME types**: `image/*,video/*`

#### **Bucket 2: user-avatars** 
- **Name**: `user-avatars`
- **Public**: ✅ Make public  
- **File size limit**: 5MB
- **Allowed MIME types**: `image/*`

### **3. API Keys Verification**

Your current credentials:
```
Project URL: https://hilukaxsamucnqdbxlwd.supabase.co
Project ID: hilukaxsamucnqdbxlwd
Anon Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbHVrYXhzYW11Y25xZGJ4bHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxNjg5NTgsImV4cCI6MjA0MTc0NDk1OH0.uBaJt7nnJNOLJAtsOjFrQvdzcG7BJ5-LopQ1ITMzhH4
```

✅ **These are already configured in the app**

### **4. Row Level Security (RLS) Policies**

The schema automatically creates RLS policies that ensure:
- ✅ Users can only access their own data
- ✅ Admin users have elevated permissions
- ✅ Social features respect privacy settings
- ✅ Media files are properly secured

### **5. Authentication Setup (Optional)**

For production, you may want to enable Supabase Auth:
1. **Navigate to Authentication** (left sidebar)
2. **Configure providers** (Email, Google, etc.)
3. **Update email templates** if desired

**Note**: The current app uses custom authentication, but can be migrated to Supabase Auth later.

---

## 🔄 **Data Migration Process**

Once Supabase is set up, existing localStorage data will be automatically migrated:

### **Migration Features**
- ✅ **Automatic detection** of existing localStorage data
- ✅ **One-click migration** for logged-in users
- ✅ **Safe migration** with error handling
- ✅ **Data validation** during transfer
- ✅ **Backup preservation** until confirmed successful

### **Migration Steps**
1. **Users log in** with their existing credentials
2. **App detects** localStorage data
3. **Migration prompt** appears
4. **Data transfers** to Supabase automatically
5. **Verification** ensures all data migrated correctly
6. **Local cleanup** (optional, after confirmation)

---

## 📊 **Database Tables Created**

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User accounts | Profiles, roles, points tracking |
| `habits` | User habits | Categories, targets, difficulty |
| `habit_completions` | Habit tracking | Date-based completion records |
| `goals` | User goals | Progress tracking, categories |
| `nutrition_logs` | Food tracking | Macros, meal types, dates |
| `media_uploads` | Progress photos | Cloud storage links, types |
| `user_achievements` | Achievement system | Unlock tracking, progress |
| `user_friends` | Social connections | Friend relationships |
| `friend_invites` | Invite system | Email invites, codes |
| `social_posts` | Activity feed | User activities, visibility |
| `competitions` | Challenges | Friend competitions |

---

## 🚀 **Production Features Unlocked**

After setup, StriveTrack will have:

### **🔒 Enterprise Security**
- Row Level Security (RLS)
- Encrypted data storage
- API key protection
- User data isolation

### **📱 Real-time Features**
- Live friend activity updates
- Real-time competition updates
- Instant achievement notifications
- Live chat capabilities (ready to implement)

### **☁️ Cloud Storage**
- 50MB+ file uploads
- CDN-delivered media
- Automatic backups
- Global availability

### **📈 Scalability**
- Unlimited users
- High-performance queries
- Auto-scaling infrastructure
- Global edge deployment

---

## 🆘 **Troubleshooting**

### **Common Issues**

**1. SQL Schema Errors**
```sql
-- If you get permission errors, run this first:
SELECT current_user;
-- Should show 'postgres' or your admin user
```

**2. Storage Bucket Issues**
- Ensure buckets are marked as "Public"
- Check file size limits are set to 50MB
- Verify MIME types include `image/*` and `video/*`

**3. RLS Policy Problems**
```sql
-- To temporarily disable RLS for testing:
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- Re-enable after testing:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

**4. Migration Issues**
- Check browser console for detailed errors
- Verify Supabase project URL is correct
- Ensure anon key has proper permissions

---

## ✅ **Verification Checklist**

After setup, verify these work:
- [ ] Database schema created (11 tables)
- [ ] Storage buckets created (user-media, user-avatars)
- [ ] RLS policies active
- [ ] Test user can be created
- [ ] File upload to storage works
- [ ] Migration helper connects successfully

---

## 🎯 **Next Steps**

1. **Complete setup** following steps above
2. **Test migration** with existing user data
3. **Verify all features** work with cloud storage
4. **Deploy to production** URL (Vercel/Netlify)
5. **Update DNS** to point to new deployment

**Once setup is complete, StriveTrack will be a fully cloud-powered fitness platform! 🚀**