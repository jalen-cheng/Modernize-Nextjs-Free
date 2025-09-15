# MedMe Assistant Setup Guide

## Quick Start

1. **Clone and Install**
   ```bash
   cd package
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual API keys
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Environment Variables Required

### Supabase (Database & Auth)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key from Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

### Vapi (Voice Calls) - Optional
- `VAPI_API_KEY` - Your Vapi API key
- `VAPI_ASSISTANT_ID` - Your voice assistant ID

### Application
- `PHARMACY_ACCESS_CODE=MEDME2025` - Default pharmacy code

## Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL from `DATABASE_SCHEMA.sql` in your Supabase SQL editor
3. This creates the `patients` and `call_log` tables with sample data

## Authentication Flow

The app uses simple email/password authentication:

1. **Sign Up**: Create account with email/password
2. **Sign In**: Login with credentials
3. **Pharmacy Code**: Enter `MEDME2025` to access dashboard
4. **Dashboard**: Access patient management interface

## Project Structure

```
package/
├── src/
│   ├── app/
│   │   ├── (DashboardLayout)/     # Main dashboard
│   │   ├── authentication/       # Login/signup pages
│   │   ├── api/                 # API routes
│   │   └── lib/                 # Utilities
│   └── types/
│       └── database.ts          # TypeScript types
├── .env.example                 # Environment template
└── DATABASE_SCHEMA.sql          # Database setup
```

## Key Features Implemented

✅ **Authentication System**
- Email/password login/signup
- Pharmacy code validation
- Session management with middleware

✅ **Database Integration**
- Supabase client and admin setup
- TypeScript types for all tables
- Row-Level Security (RLS) policies

✅ **Patient Management Dashboard**
- Patient list with search/filter
- Call initiation interface
- Recent call logs display

✅ **API Infrastructure**
- Pharmacy code validation endpoint
- Call initiation endpoint
- Vapi webhook receiver (ready for integration)

## Next Steps

1. **Set up your Supabase project** and add real API keys to `.env.local`
2. **Configure Vapi account** if you want voice call functionality
3. **Test the complete flow**: signup → login → pharmacy code → dashboard
4. **Add real patient data** through the dashboard interface

## Troubleshooting

- **Database connection issues**: Verify Supabase keys in `.env.local`
- **Authentication problems**: Check browser console for detailed errors
- **Middleware redirects**: Ensure pharmacy code validation is working

The application is now ready for development and testing with proper environment configuration.
