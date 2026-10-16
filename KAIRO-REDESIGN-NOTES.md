# Kairo — redesign bundle

Brand: Kairo  
Tagline: Make Today Count.

## Included
- Warm, very light pastel app palette: ivory, cream, peach, soft coral, blush pink and powder blue.
- Orbit-inspired launcher/app logo and updated splash screens.
- Soft tinted goal cards and more consistent target-date/streak columns.
- Compact 5x2 and large native Android widgets with rounded pastel surfaces.
- Branded native widget goal picker with an empty state instead of sample goals.
- Widget Check In remains a dedicated direct action; other widget areas open Kairo.
- Existing Android application ID `com.streakdown.app` is preserved.
- Known legacy sample goal IDs are filtered out without deleting other user-created goals.

## Build in the existing Codespace
Run from the repository root (the folder containing `package.json`):

```bash
unzip -o kairo-pastel-final-source.zip -d . && npm run build && npx --yes cap sync android && cd android && ./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

Do not clear app data during installation. The source bundle and XML were checked for archive/XML integrity, but a full Vite/Gradle build and device test still need to be run in the existing Codespace.
