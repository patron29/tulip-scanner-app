# Tulip - Product Scanner App

## Current Status
- React web app with mobile-first design
- Mock authentication implemented
- User tiers: Free (5 scans), Basic ($4.99, 100 scans), Premium ($9.99, unlimited)
- Features: Barcode scanning, price comparison, coupons
- Tulip branding with pink/purple theme

## Tech Stack
- React 18
- Tailwind CSS (via CDN)
- Lucide React icons
- Mock data (ready for real APIs)

## Current Issues
- Mobile dropdown menu positioning
- Need to implement real barcode scanning
- Need backend for authentication

## File Structure
- Components: HomeScreen, ScannerScreen, ProductDetailScreen, LoginScreen, UpgradeModal
- Services: productService, priceService, authService
- Utils: helpers, constants, tierConfig
- Contexts: AuthContext

## Next Steps
- Convert to React Native for real mobile app
- Implement real Google/Apple sign-in
- Add backend API
- Deploy to app stores