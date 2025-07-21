# LuckyCookie.io

## Prize Management
All prizes are now managed manually through the database. There is no automatic syncing with external APIs.

### Adding Prizes
1. Access the admin panel at `/admin`
2. Use the "Static Prize Inventory" section to add new prizes
3. Or add prizes directly to the `dynamic_prizes` table in the database with `source = 'manual'`

## Features
A premium fortune cookie web application with Gumroad integration for premium tiers.
- **Free Fortune Cookies**: Crack a free cookie every hour
- **Premium Tiers**: 5 premium tiers (Bronze, Silver, Gold, Sapphire, Diamond) with guaranteed prizes
- **Gumroad Integration**: Secure payment processing through Gumroad
- **User Dashboard**: Track your crack history, streaks, and wins
- **Admin Panel**: Comprehensive admin dashboard for managing users, prizes, and purchases
- **Manual Prize Management**: All prizes are managed manually through the database
## Gumroad Integration
### Product Links
- **Bronze**: https://653415968405.gumroad.com/l/amvjh
- **Silver**: https://653415968405.gumroad.com/l/samzj
- **Gold**: https://653415968405.gumroad.com/l/pjaep
- **Sapphire**: https://653415968405.gumroad.com/l/ncbkj
- **Diamond**: https://653415968405.gumroad.com/l/sfrvaq
### Webhook Setup
1. In your Gumroad dashboard, go to Settings > Advanced
2. Set the webhook URL to: `https://your-deployed-app.com/functions/v1/gumroad-webhook`
3. The webhook will automatically verify purchases and allow users to crack their premium cookies
### How It Works
1. User selects a premium tier and clicks "Buy Now"
2. They're redirected to Gumroad for secure payment
3. After payment, Gumroad sends a webhook to our server
4. The webhook verifies the purchase and stores it in the database
5. User is redirected back to the premium crack page
6. They can now crack their premium cookie and receive their guaranteed prize
## Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Gumroad API (optional - for advanced features)
VITE_GUMROAD_ACCESS_TOKEN=your_gumroad_access_token
```
## Development
```bash
npm install
npm run dev
```
## Deployment
1. Deploy to your preferred platform (Netlify, Vercel, etc.)
2. Set up the Supabase database using the provided migrations
3. Configure the Gumroad webhook URL in your Gumroad dashboard
4. Update environment variables in your deployment platform
## Admin Access
Access the admin panel at `/admin` with password: `luckybones2024`
The admin panel allows you to:
- View user statistics and activity
- Manage premium purchases
- Manage manual prizes inventory
- Track shipments for physical prizes
- Configure application settings
- Monitor webhook logs