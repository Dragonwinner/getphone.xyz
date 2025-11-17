# GetPhone.xyz Mobile App

React Native mobile application for GetPhone.xyz phone comparison platform.

**Available for both iOS and Android!** Build your own APK file for Android distribution.

## Quick Start

### Android APK Build (No Android Studio Required!)

For quick APK generation, see our detailed guide: **[ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md)**

**TL;DR:**
```bash
cd mobile
npm install
npm run build:android        # Builds release APK
# APK location: android/app/build/outputs/apk/release/app-release.apk
```

## Prerequisites

- Node.js 18+
- React Native CLI
- **For Android:** JDK 17 + Android SDK
- **For iOS:** Xcode (macOS only)

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

### Android APK

**Detailed instructions:** See [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md)

**Quick build:**
```bash
# Debug APK (for testing)
npm run build:android:debug

# Release APK (for distribution)
npm run build:android

# Android App Bundle (for Google Play Store)
npm run build:android:bundle
```

**APK Locations:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`
- Bundle: `android/app/build/outputs/bundle/release/app-release.aab`

### iOS
```bash
npm run build:ios
```

**Note:** iOS builds require a Mac with Xcode and an Apple Developer account.

### Installing APK on Android Device

1. **Via ADB (USB):**
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

2. **Via File Transfer:**
   - Copy APK to device
   - Open file and install
   - Enable "Install from Unknown Sources" if prompted

## Testing

```bash
npm test
```

## License

MIT
