# LuckyCookie.io

## Features
A premium fortune cookie web application with Gumroad integration for premium tiers.
- **Free Fortune Cookies**: Crack a free cookie every hour
- **Premium Tiers**: 5 premium tiers (Bronze, Silver, Gold, Sapphire, Diamond) with guaranteed prizes
- **Gumroad Integration**: Secure payment processing through Gumroad
- **User Dashboard**: Track your crack history, streaks, and wins
- **Admin Panel**: Comprehensive admin dashboard for managing users, prizes, and purchases
- **Manual Prize Management**: All prizes are managed manually through the database

### How It Works
1. User selects a premium tier and clicks "Buy Now"
2. They're redirected to Gumroad for secure payment
3. After payment, Gumroad sends a webhook to our server
4. The webhook verifies the purchase and stores it in the database
5. User is redirected back to the premium crack page
6. They can now crack their premium cookie and receive their guaranteed prize
