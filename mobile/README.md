# GetPhone.xyz Mobile App

React Native mobile application for GetPhone.xyz phone comparison platform.

## Prerequisites

- Node.js 18+
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

## Getting Started

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. iOS Setup

```bash
cd ios
pod install
cd ..
```

### 3. Running the App

#### iOS
```bash
npm run ios
# or
npx react-native run-ios
```

#### Android
```bash
npm run android
# or
npx react-native run-android
```

## Project Structure

```
mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── services/        # API services
│   ├── store/           # State management
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── App.tsx          # Main app component
├── android/             # Android native code
├── ios/                 # iOS native code
├── package.json
└── tsconfig.json
```

## Features

- Browse phones with advanced filters
- Compare phones side by side
- Price tracking and alerts
- User authentication
- Push notifications for price drops
- Offline support
- Dark mode support

## API Configuration

Set the API base URL in `src/config/api.ts`:

```typescript
export const API_BASE_URL = 'https://api.getphone.xyz';
```

## Building for Production

### iOS
```bash
npm run build:ios
```

### Android
```bash
npm run build:android
```

## Testing

```bash
npm test
```

## License

MIT
