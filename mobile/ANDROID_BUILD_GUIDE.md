# Building Android APK for GetPhone.xyz

This guide will help you build the Android APK for the GetPhone.xyz mobile application.

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Java Development Kit (JDK) 17** - [Download](https://www.oracle.com/java/technologies/downloads/)
3. **Android Studio** - [Download](https://developer.android.com/studio)
4. **Android SDK** (installed via Android Studio)
5. **React Native CLI** - Install globally: `npm install -g react-native-cli`

## Initial Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Android SDK Setup

Make sure you have the following Android SDK components installed via Android Studio SDK Manager:
- Android SDK Platform 34
- Android SDK Build-Tools 34.0.0
- Android SDK Platform-Tools
- Android Emulator (optional, for testing)

### 3. Environment Variables

Add these to your system environment variables (or `~/.bashrc` / `~/.zshrc` on macOS/Linux):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# OR
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
# OR
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk    # Windows

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Building APK

### Option 1: Debug APK (For Testing)

The debug APK is automatically signed with a debug keystore and can be installed immediately.

```bash
cd mobile
npm run build:android:debug
```

The APK will be generated at:
```
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

**Install on device:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Option 2: Release APK (For Distribution)

#### Step 1: Generate a Release Keystore

First time only - generate a signing keystore:

```bash
cd mobile/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias getphone-release -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted for:
- Keystore password (remember this!)
- Key password (remember this!)
- Your name, organization, city, state, country

**Important:** Keep your `release.keystore` file and passwords safe! You'll need them for all future app updates.

#### Step 2: Configure Environment Variables (Production)

For production builds, set these environment variables:

**macOS/Linux:**
```bash
export RELEASE_STORE_PASSWORD="your_keystore_password"
export RELEASE_KEY_ALIAS="getphone-release"
export RELEASE_KEY_PASSWORD="your_key_password"
```

**Windows:**
```cmd
set RELEASE_STORE_PASSWORD=your_keystore_password
set RELEASE_KEY_ALIAS=getphone-release
set RELEASE_KEY_PASSWORD=your_key_password
```

Or add them to `mobile/android/gradle.properties` (NOT recommended for Git repositories):
```properties
RELEASE_STORE_PASSWORD=your_password
RELEASE_KEY_ALIAS=getphone-release
RELEASE_KEY_PASSWORD=your_password
```

#### Step 3: Build Release APK

```bash
cd mobile
npm run build:android
```

The signed APK will be generated at:
```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

### Option 3: Android App Bundle (AAB) - For Google Play Store

Google Play Store requires AAB format instead of APK:

```bash
cd mobile
npm run build:android:bundle
```

The AAB will be generated at:
```
mobile/android/app/build/outputs/bundle/release/app-release.aab
```

## File Locations

After building, your APK/AAB files will be in:

- **Debug APK:** `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK:** `mobile/android/app/build/outputs/apk/release/app-release.apk`
- **Release AAB:** `mobile/android/app/build/outputs/bundle/release/app-release.aab`

## Installing APK on Device

### Via USB (ADB)

1. Enable USB debugging on your Android device
2. Connect device via USB
3. Run:
```bash
adb install path/to/app-release.apk
```

### Via File Transfer

1. Transfer the APK to your device (email, cloud storage, USB)
2. Open the APK file on your device
3. Allow installation from unknown sources if prompted
4. Install the app

## Reducing APK Size

To build APKs for specific architectures (smaller file size):

### For ARM devices (most phones):
```bash
cd mobile/android
./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a
```

### For x86 devices (emulators):
```bash
cd mobile/android
./gradlew assembleRelease -PreactNativeArchitectures=x86,x86_64
```

## Troubleshooting

### 1. "SDK location not found"
- Set ANDROID_HOME environment variable
- Restart terminal/IDE after setting

### 2. "Unable to find bundled Java"
- Install JDK 17
- Set JAVA_HOME environment variable

### 3. "Execution failed for task ':app:validateSigningRelease'"
- Check keystore file exists at `mobile/android/app/release.keystore`
- Verify environment variables are set correctly
- Ensure passwords match the keystore

### 4. "Clean build" (if things aren't working)
```bash
cd mobile
npm run clean:android
npm run build:android
```

### 5. Metro Bundler Issues
```bash
# Clear cache
npm start -- --reset-cache
```

## App Configuration

### Change App Name
Edit `mobile/android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">YourAppName</string>
```

### Change Package Name
1. Update in `mobile/android/app/build.gradle`:
```gradle
applicationId "com.yourcompany.yourapp"
```

2. Rename Java package directories and update imports

### Change App Icon
Replace launcher icons in:
```
mobile/android/app/src/main/res/mipmap-*/ic_launcher.png
```

## Publishing to Google Play Store

1. Build release AAB (not APK):
```bash
npm run build:android:bundle
```

2. Create a Google Play Developer account ($25 one-time fee)

3. Upload the AAB file at https://play.google.com/console

4. Complete store listing:
   - App description
   - Screenshots
   - Icons
   - Content rating
   - Privacy policy URL

5. Submit for review

## Version Management

Update version in `mobile/android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 2        // Integer - increment for each release
    versionName "1.0.1"  // String - semantic versioning
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd mobile
          npm install
      
      - name: Build Release APK
        env:
          RELEASE_STORE_PASSWORD: ${{ secrets.RELEASE_STORE_PASSWORD }}
          RELEASE_KEY_ALIAS: ${{ secrets.RELEASE_KEY_ALIAS }}
          RELEASE_KEY_PASSWORD: ${{ secrets.RELEASE_KEY_PASSWORD }}
        run: |
          cd mobile
          npm run build:android
      
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release
          path: mobile/android/app/build/outputs/apk/release/app-release.apk
```

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Android Publishing Guide](https://reactnative.dev/docs/signed-apk-android)
- [Google Play Console](https://play.google.com/console)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)

## Support

For issues specific to GetPhone.xyz mobile app:
1. Check the main README.md
2. Review server API documentation
3. Ensure backend API is running and accessible
