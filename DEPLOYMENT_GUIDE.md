# Vercel Deployment Guide for MedMe Assistant

## Pre-Deployment Checklist ✅

Your code is now **Vercel-ready**! Here's what you need to do on Vercel:

## 1. Project Setup on Vercel

### Import Your Repository
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository: `MedMeAssistant`
4. Vercel will auto-detect it as a Next.js project

### Configure Build Settings
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `package` (CRITICAL - Must be set!)
- **Build Command**: `npm run build` (auto-configured)
- **Output Directory**: `.next` (auto-configured)
- **Install Command**: `npm install` (auto-configured)

## 2. Environment Variables Setup

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Vapi Configuration
VAPI_API_KEY=your_vapi_api_key
VAPI_WORKFLOW_ID=your_vapi_workflow_uuid
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_uuid
VAPI_WEBHOOK_SECRET=your_webhook_secret

# Twilio Configuration (for Canadian calling)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Pharmacy Access
PHARMACY_CODE=MEDME2024
```

## 3. Domain Configuration

### Custom Domain (Optional)
1. Go to Project → Settings → Domains
2. Add your custom domain (e.g., `medme-assistant.yourdomain.com`)
3. Configure DNS records as instructed

### Webhook URLs
After deployment, update your Vapi webhook URLs to:
- Identity Verification: `https://your-app.vercel.app/api/vapi/verifyIdentity`
- Call Complete: `https://your-app.vercel.app/api/vapi/complete`

## 4. Database Setup

### Supabase Configuration
1. Ensure your Supabase project is running
2. Run the `DATABASE_SCHEMA.sql` in Supabase SQL Editor
3. Configure Row-Level Security policies
4. Test database connection from Vercel environment

## 5. Post-Deployment Testing

### Test These Features
- [ ] Authentication flow (login/signup)
- [ ] Pharmacy code validation
- [ ] Patient management (add/view patients)
- [ ] Voice call initiation
- [ ] Webhook endpoints (identity verification)
- [ ] Database operations

### Monitor Deployment
- Check Vercel Function Logs for any errors
- Test API endpoints: `/api/call`, `/api/vapi/*`
- Verify environment variables are loaded correctly

## 6. Production Considerations

### Security
- Ensure all sensitive data is in environment variables
- Verify webhook secret validation is working
- Test Row-Level Security policies

### Performance
- Monitor function execution times
- Check database query performance
- Optimize API response times

### Monitoring
- Set up Vercel Analytics (optional)
- Monitor error rates in Vercel dashboard
- Set up alerts for critical failures

## Troubleshooting

### 404 NOT_FOUND Error Fix
**CRITICAL**: If you get a 404 error, the issue is Root Directory configuration:

1. **In Vercel Dashboard**:
   - Go to Project → Settings → General
   - Set **Root Directory** to `package`
   - Click **Save**
   - Redeploy the project

2. **Alternative Method**:
   - Delete the project in Vercel
   - Re-import and ensure Root Directory is set to `package` during initial setup

### Common Issues
1. **Build fails**: Check if `package` directory structure is correct
2. **API routes not working**: Verify environment variables are set
3. **Database connection fails**: Check Supabase URL and keys
4. **Webhook errors**: Verify webhook secret matches Vapi configuration
5. **404 on all pages**: Root Directory not set to `package`

### Debug Steps
1. Check Vercel Function Logs
2. Test API endpoints individually
3. Verify environment variable values
4. Check Supabase logs for database issues

## Success Indicators

Your deployment is successful when:
- ✅ Login page loads correctly
- ✅ Authentication works end-to-end
- ✅ Dashboard displays patient data
- ✅ Voice calls can be initiated
- ✅ Webhooks receive and process data correctly

## Next Steps After Deployment

1. **Test with real phone numbers**
2. **Configure production Vapi workflows**
3. **Set up monitoring and alerts**
4. **Document API endpoints for team use**
5. **Plan for scaling and performance optimization**
