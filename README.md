# PackVeri Packer Mobile Application

A production-ready React Native mobile application built with **Expo**, **TypeScript**, and **React Native Paper** for warehouse packers.

This app is the counterpart to the Packaging Verification System admin panel, designed specifically for warehouse use.

---

## Technical Stack

*   **Runtime**: Expo Go (SDK 57)
*   **Language**: TypeScript
*   **UI Components**: React Native Paper (Material Design 3)
*   **Data Fetching & Cache**: TanStack Query (React Query v5) & Axios
*   **Form & Validation**: React Hook Form & Zod
*   **Auth Persistence**: AsyncStorage (Sanctum Tokens)
*   **Media / Camera**: Expo Image Picker (Native Camera UI launcher)

---

## Directory Structure

```
packaging_app_packer_app/
  App.tsx              ← App entry, providers mount (Query, Theme, Navigation, Auth)
  app.json             ← Expo config (includes permissions metadata for camera)
  src/
    api/
      client.ts        ← Axios client (attaches bearer tokens, auto-eject interceptors)
      auth.ts          ← Login, logout, profile loading API
      orders.ts        ← Orders checklist, confirmer, starts, completes, multipart photo uploads
    components/
      OrderCard.tsx    ← High-contrast order overview card
      ProductCard.tsx  ← Verification stepper component with fragile alerts
      StatusBadge.tsx  ← Colored status pill
      PriorityBadge.tsx← Low, normal, high, urgent urgency badging
      ProgressTracker.tsx ← Live packing checks visualizer
    screens/
      LoginScreen.tsx  ← Authenticate packer with React Hook Form + Zod custom resolver
      HomeScreen.tsx   ← Paginated list of active orders with refresh & search controls
      OrderDetailsScreen.tsx ← Core packing checklist, photo capture, completion rules
      SettingsScreen.tsx  ← Diagnostics panel for testing backend and customizing host IPs
    navigation/
      AppNavigator.tsx ← AuthStack vs MainTabs
    hooks/
      useAuth.tsx      ← Context provider for login status and persisted API URLs
    types/
      index.ts         ← TS types matching database schemas
```

---

## Setup & Running Locally

Since the application runs inside **Expo Go**, you do not need local Android SDKs or iOS Xcode compilers to run and test it.

### 1. Install Dependencies
Make sure you have Node.js installed, then run:
```bash
npm install
```

### 2. Run the Development Server
```bash
npx expo start
```
This will start the Expo dev server and display a QR code in the terminal.

### 3. Connect a Mobile Device / Emulator
*   **Physical Device**: Download **Expo Go** from the iOS App Store or Google Play Store. Scan the terminal's QR code using your phone's camera (iOS) or the Expo Go app scan button (Android).
*   **Emulator**: Press `a` in the terminal for Android Emulator or `i` for iOS Simulator.

### 4. Configuration (Settings Tab)
When testing on a physical device or external emulator:
1. Tap the **Settings** tab.
2. Edit the **API Base URL** to match your host machine's IP (e.g. `http://192.168.1.15:8000/api`).
3. Click **SAVE URL** and press **TEST** to verify communication with the Laravel backend.

---

## Cloud Build Instructions (Expo EAS)

Since you do not have local compilers installed, all production-ready IPA (iOS) or APK/AAB (Android) builds will happen on the **Expo Cloud** via **EAS (Expo Application Services)**.

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Log in to your Expo Account
```bash
eas login
```

### 3. Initialize EAS Configuration
```bash
eas build:configure
```
This will create a `eas.json` file in the root of your project specifying your build profiles (development, preview, production).

### 4. Trigger Cloud Builds
Run the appropriate command below depending on the target package:

#### Build Android APK (for testing directly on physical Android phones):
Ensure you configure a profile in `eas.json` with `"developmentClient": false` and `"distribution": "internal"`, then run:
```bash
eas build --platform android --profile preview
```

#### Build Android Bundle (for Google Play Store production distribution):
```bash
eas build --platform android --profile production
```

#### Build iOS App Store Package:
```bash
eas build --platform ios --profile production
```

*The Expo Cloud builder will queue your build, compile it in a clean VM, inject the camera and gallery permissions configured in `app.json`, and provide a downloadable link or QR code once finished.*
