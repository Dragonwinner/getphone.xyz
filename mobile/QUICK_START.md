# GetPhone.xyz Mobile App - Quick Start Guide

Get the GetPhone.xyz mobile app on your Android device in 3 easy steps!

## 🚀 For End Users (Installing APK)

### Option 1: Download Pre-built APK (Recommended)

1. **Download** the APK file:
   - Get the latest `app-release.apk` from your organization
   - Or build it yourself (see Option 2)

2. **Enable Unknown Sources:**
   - Go to Settings → Security → Unknown Sources
   - Or Settings → Apps → Special Access → Install Unknown Apps
   - Enable for your file manager or browser

3. **Install:**
   - Open the downloaded APK file
   - Tap "Install"
   - Open the app and enjoy!

### Option 2: Build Your Own APK

**Prerequisites:**
- Node.js 18+
- JDK 17
- Android SDK

**Steps:**
```bash
# 1. Clone repository
git clone https://github.com/Dragonwinner/getphone.xyz.git
cd getphone.xyz/mobile

# 2. Install dependencies
npm install

# 3. Build APK
npm run build:android:debug

# 4. Find your APK at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Transfer to device:**
- USB: `adb install android/app/build/outputs/apk/debug/app-debug.apk`
- Or: Copy file to device and install

## 🛠️ For Developers

See our comprehensive guides:
- **[ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md)** - Complete Android build instructions
- **[README.md](./README.md)** - Full mobile app documentation

### Quick Development Setup

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

## 📱 App Features

- Browse 1000+ phones with detailed specifications
- Compare up to 4 phones side-by-side
- Set price alerts for your favorite phones
- Real-time price updates
- User authentication
- Dark mode support
- Offline support

## 🔧 Configuration

### Connect to Your Backend

Edit `src/config/api.ts`:
```typescript
export const API_BASE_URL = 'https://your-api-domain.com/api';
// or use local: 'http://localhost:3001/api'
```

### Troubleshooting

**App won't install?**
- Enable "Install from Unknown Sources"
- Check if you have enough storage space
- Try uninstalling previous version first

**Can't connect to API?**
- Check your internet connection
- Verify API_BASE_URL is correct
- Ensure backend server is running

**Build failed?**
- Run `npm run clean:android`
- Delete `node_modules` and run `npm install` again
- Ensure JDK 17 and Android SDK are installed

## 📞 Support

For issues:
1. Check [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md)
2. Review main [README.md](../README.md)
3. Check backend server logs

## 🎯 Next Steps

1. **For Users:** Download and install the APK
2. **For Developers:** Follow [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md)
3. **For Production:** See deployment section in ANDROID_BUILD_GUIDE.md

---

**Ready to compare phones on the go? Get the APK and install now!** 📱
