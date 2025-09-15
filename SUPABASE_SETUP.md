# Supabase Setup Instructions for MedMe Assistant

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `MedMe Assistant`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

## 2. Configure Authentication

### Enable Email OTP Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Auth Providers**, find **Email**
3. Enable **Email OTP** (One-Time Password)
4. Configure email settings:
   - **Enable email confirmations**: ON
   - **Enable email change confirmations**: ON
   - **Enable secure email change**: ON

### Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the **Magic Link** template for OTP emails
3. You can modify the subject and body to match your branding

## 3. Get Environment Variables

1. Go to **Settings** → **API**
2. Copy the following values:

```env
# Add these to your .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Update Your .env.local File

Add the Supabase credentials to your environment file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Pharmacy Configuration
PHARMACY_CODE=MEDME2025
```

## 5. Test Authentication Flow

1. Start your development server: `npm run dev`
2. Navigate to `/authentication/login`
3. Test the email OTP flow:
   - Enter your email address
   - Check your email for the 6-digit OTP code
   - Enter the OTP code
   - Enter pharmacy code: `MEDME2025`
   - You should be redirected to the dashboard

## 6. Database Schema (Optional)

If you want to store additional user data, create these tables in **SQL Editor**:

```sql
-- Users table for additional profile data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  pharmacy_access BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 7. Security Configuration

### RLS Policies
- Row Level Security (RLS) is automatically enabled for auth tables
- The profiles table (if created) has RLS policies to ensure users can only access their own data

### Email Rate Limiting
- Supabase automatically rate limits email sending to prevent abuse
- Default: 3 emails per hour per email address

## 8. Production Considerations

### Custom SMTP (Recommended for Production)
1. Go to **Settings** → **Authentication** → **SMTP Settings**
2. Configure your own SMTP provider (SendGrid, Mailgun, etc.)
3. This ensures better deliverability and removes Supabase branding

### Domain Configuration
1. Add your production domain to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain
3. Add **Redirect URLs** for your app

## 9. Troubleshooting

### Common Issues:

**OTP not received:**
- Check spam folder
- Verify email address is correct
- Check Supabase logs in **Logs** → **Auth**

**Environment variables not working:**
- Restart your development server after adding .env.local
- Ensure .env.local is in your project root
- Check that variables start with `NEXT_PUBLIC_` for client-side access

**Authentication errors:**
- Check browser console for detailed error messages
- Verify Supabase URL and keys are correct
- Ensure your domain is added to allowed origins

## 10. Current Pharmacy Code

The current pharmacy access code is: **`MEDME2025`**

Users must enter this code after email verification to access the dashboard. You can change this code in `/package/src/app/lib/schema.ts` by modifying the `PHARMACY_CODE` constant.

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
