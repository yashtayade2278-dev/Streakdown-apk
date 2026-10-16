# StreakDown Android native widgets — build notes

## What was fixed
- Added real Android AppWidgetProvider implementations for compact and large home-screen widgets.
- Added a native widget configuration screen so each widget instance can select a goal.
- Added a widget Check In receiver. Check-ins run in Android without opening the app and are saved in app-private SharedPreferences.
- Added a Capacitor bridge (`StreakDownNative`) to sync the web app's local goal data to the native widget store.
- Added foreground resynchronization so widget-originated check-ins are imported into the web UI when the app returns to the foreground.
- Added native widget declarations to the Android manifest and metadata XML.
- Fixed the GitHub Actions Node setup so it does not expect a nonexistent package-lock.json.

## Build on GitHub
1. Upload/commit the contents of this ZIP into your repository's root (preserve the `android/`, `src/`, and `.github/` folders).
2. Open **Actions** → **Build StreakDown Android APK** → **Run workflow**.
3. Wait for the workflow to finish successfully.
4. Open that run, download artifact `StreakDown-debug-apk`, and extract `app-debug.apk`.

Expected output: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Test native widgets on Android
1. Install the APK and open StreakDown at least once.
2. Create a goal (or make sure at least one goal exists) and let the app save it.
3. Long-press the home screen → Widgets → StreakDown.
4. Add either the compact or large widget, then select a goal in the configuration screen.
5. Tap **Check in** on the widget. It should update without opening the app. Reopen StreakDown to import the updated check-in into the app view.

## Important limitation
This adds genuine Android home-screen widgets. The current project still stores the main UI's goals in WebView localStorage and mirrors them to native app-private storage through the Capacitor bridge. If Android force-stops the app or the WebView storage is cleared, validate synchronization before relying on the data. No cloud account or server is used by the widget code.
