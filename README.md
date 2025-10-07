# GetPhone.xyz - Phone Comparison & Affiliate Platform

A modern phone comparison website with Amazon affiliate integration, built with React, TypeScript, and Vite.

## Features

### 1. Phone Comparison Tool
- Compare up to 4 phones side by side
- Visual comparison of specifications, features, and prices
- Automatic highlighting of best values (best price, highest rating, most RAM/storage/battery)
- Easy-to-use checkbox selection from the phones listing page
- Persistent comparison state across page navigation

### 2. Amazon Affiliate Integration
- Each phone includes Amazon ASIN (Amazon Standard Identification Number)
- Direct affiliate links to Amazon India
- Product URLs formatted for affiliate tracking
- Ready for Amazon Product Advertising API integration

### 3. Product Database Schema
The application is designed to work with Supabase and includes the following database structure:

#### Tables:
- **phones** - Main product catalog with specs, pricing, and affiliate links
- **affiliate_accounts** - Manage multiple Amazon affiliate accounts
- **comparisons** - Store user comparison sessions
- **product_sync_log** - Track affiliate product synchronization

### 4. Key Functionalities

#### Phone Listings
- Advanced filtering by brand and category
- Sort by price (ascending/descending) or rating
- Search functionality across phone names and descriptions
- Responsive grid layout with detailed phone cards

#### Comparison Features
- Select phones for comparison using checkboxes
- Compare specifications side by side
- Highlight best values automatically
- Direct links to Amazon and product detail pages
- Responsive table design

#### Navigation
- Clean header with search functionality
- Direct link to comparison tool
- Mobile-friendly menu

## Domain
Website configured for: **getphone.xyz** / **getphones.xyz**

## Tech Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)
- Supabase (database)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Amazon Affiliate Setup

To enable full Amazon affiliate functionality:

1. Sign up for Amazon Associates program
2. Get your affiliate tag
3. Update the affiliate links in `/src/data/mockData.ts` with your tag
4. For auto-fetch functionality, configure Amazon Product Advertising API credentials

## Future Enhancements

### Planned Features:
- Amazon Product Advertising API integration for real-time data
- Auto-sync affiliate product details (pricing, availability, reviews)
- User accounts to save comparisons
- Price tracking and alerts
- Affiliate earnings dashboard
- SEO optimizations for individual product pages
- Blog/content section for phone reviews

## File Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PhoneCard.tsx
│   └── SEO.tsx
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── PhonesPage.tsx
│   ├── PhoneDetailPage.tsx
│   ├── ComparePage.tsx
│   └── ...
├── data/               # Mock data and types
│   └── mockData.ts
├── types.ts            # TypeScript interfaces
└── App.tsx             # Main app component
```

## Contributing

This is a production-ready phone comparison and affiliate marketing platform. Feel free to customize the data, styling, and features to match your needs.

## License

MIT License
