package com.streakdown.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

final class WidgetViews {
    // Same four palettes as the goal cards in the app (+ green when a goal is completed).
    private static final int[] BG = { R.drawable.widget_bg_0, R.drawable.widget_bg_1, R.drawable.widget_bg_2, R.drawable.widget_bg_3, R.drawable.widget_bg_4 };
    private static final int[] BAR = { R.id.widget_progress_0, R.id.widget_progress_1, R.id.widget_progress_2, R.id.widget_progress_3, R.id.widget_progress_4 };
    private static final int[] ACCENT = { 0xFFE9784E, 0xFFD85D87, 0xFF4389C8, 0xFFB88749, 0xFF3E9B5B };
    private static void applyPalette(RemoteViews v, int p, int progress, boolean showBar) {
        v.setInt(R.id.widget_root, "setBackgroundResource", BG[p]);
        v.setTextColor(R.id.widget_streak_value, ACCENT[p]);
        for (int i = 0; i < BAR.length; i++) v.setViewVisibility(BAR[i], (showBar && i == p) ? android.view.View.VISIBLE : android.view.View.GONE);
        if (showBar) v.setProgressBar(BAR[p], 100, progress, false);
    }
    private static int paletteIndex(Context c, String goalId) {
        org.json.JSONArray all = WidgetStore.getGoals(c);
        for (int i = 0; i < all.length(); i++) { JSONObject o = all.optJSONObject(i); if (o != null && goalId.equals(o.optString("id"))) return i % 4; }
        return 0;
    }
    static final String ACTION_CHECK_IN = "com.streakdown.app.WIDGET_CHECK_IN";
    static RemoteViews create(Context c, int widgetId, boolean large) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_large_native);
        String goalId = WidgetStore.goalIdForWidget(c, widgetId);
        JSONObject g = WidgetStore.findGoal(c, goalId);
        if (g == null) {
            v.setTextViewText(R.id.widget_title, "Kairo");
            v.setTextViewText(R.id.widget_streak_icon, "");
            v.setTextViewText(R.id.widget_streak_value, "");
            v.setTextViewText(R.id.widget_streak_unit, "");
            v.setTextViewText(R.id.widget_countdown_value, "");
            v.setTextViewText(R.id.widget_countdown, "Create a goal in Kairo first");
            v.setTextViewText(R.id.widget_target, "");
            applyPalette(v, 0, 0, false);
            v.setViewVisibility(R.id.widget_countdown_value, android.view.View.VISIBLE);
            v.setViewVisibility(R.id.widget_checkin, android.view.View.VISIBLE);
            v.setViewPadding(R.id.widget_countdown_box, 0, 0, 0, 0);
            v.setTextViewTextSize(R.id.widget_countdown, android.util.TypedValue.COMPLEX_UNIT_SP, 15);
            v.setTextViewText(R.id.widget_checkin, "Open app");
            Intent open = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
            if (open != null) { PendingIntent launch = PendingIntent.getActivity(c, widgetId + 20000, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE); v.setOnClickPendingIntent(R.id.widget_root, launch); v.setOnClickPendingIntent(R.id.widget_title, launch); v.setOnClickPendingIntent(R.id.widget_streak_icon, launch); v.setOnClickPendingIntent(R.id.widget_streak_value, launch); v.setOnClickPendingIntent(R.id.widget_streak_unit, launch); v.setOnClickPendingIntent(R.id.widget_countdown_value, launch); v.setOnClickPendingIntent(R.id.widget_countdown, launch); }
            return v;
        }
        String title = g.optString("title", "Untitled goal");
        int streak = WidgetStore.activeStreak(g);
        String today = WidgetStore.today(); boolean checked = false;
        org.json.JSONArray arr=g.optJSONArray("checkIns"); if(arr!=null) for(int i=0;i<arr.length();i++) if(today.equals(arr.optString(i))) checked=true;
        int days=0; String target=g.optString("targetDate", today);
        try {
            java.text.SimpleDateFormat fmt=new java.text.SimpleDateFormat("yyyy-MM-dd",Locale.US); fmt.setLenient(false);
            Calendar a=Calendar.getInstance(), b=Calendar.getInstance(); a.setTime(fmt.parse(today)); b.setTime(fmt.parse(target));
            days=(int)((b.getTimeInMillis()-a.getTimeInMillis())/86400000L);
        } catch(Exception ignored) {}
        String targetText = ""; int progress = 0;
        try {
            SimpleDateFormat iso = new SimpleDateFormat("yyyy-MM-dd", Locale.US); iso.setLenient(false);
            java.util.Date t = iso.parse(target);
            targetText = new SimpleDateFormat("MMM d, yyyy", Locale.getDefault()).format(t);
            String created = g.optString("createdAt", today);
            java.util.Date s0 = iso.parse(created.length() >= 10 ? created.substring(0, 10) : today);
            long total = t.getTime() - s0.getTime(), done = iso.parse(today).getTime() - s0.getTime();
            progress = total <= 0 ? (days <= 0 ? 100 : 0) : (int) Math.max(0, Math.min(100, (done * 100L) / total));
        } catch (Exception ignored) {}
        if (days <= 0) progress = 100;
        v.setTextViewText(R.id.widget_title, title);
        v.setTextViewText(R.id.widget_target, days > 0 ? "until " + targetText : targetText);
        applyPalette(v, days <= 0 ? 4 : paletteIndex(c, goalId), progress, true);
        v.setTextViewText(R.id.widget_streak_icon, "🔥");
        v.setTextViewText(R.id.widget_streak_value, String.valueOf(streak));
        v.setTextViewText(R.id.widget_streak_unit, streak == 1 ? "day" : "days");
        boolean completed = days <= 0;
        float density = c.getResources().getDisplayMetrics().density;
        if (completed) {
            // Goal reached: no "0" counter and no Check In button, just a clear completed message.
            v.setViewVisibility(R.id.widget_countdown_value, android.view.View.GONE);
            v.setViewVisibility(R.id.widget_checkin, android.view.View.GONE);
            v.setViewPadding(R.id.widget_countdown_box, 0, 0, 0, 0);
            v.setTextViewTextSize(R.id.widget_countdown, android.util.TypedValue.COMPLEX_UNIT_SP, 22);
            v.setTextViewText(R.id.widget_countdown, "Goal completed \uD83C\uDF89");
            v.setTextViewText(R.id.widget_target, targetText);
        } else {
            v.setViewVisibility(R.id.widget_countdown_value, android.view.View.VISIBLE);
            v.setViewVisibility(R.id.widget_checkin, android.view.View.VISIBLE);
            v.setViewPadding(R.id.widget_countdown_box, (int) (8 * density), 0, 0, (int) (5 * density));
            v.setTextViewTextSize(R.id.widget_countdown, android.util.TypedValue.COMPLEX_UNIT_SP, 15);
            v.setTextViewText(R.id.widget_countdown_value, String.valueOf(days));
            v.setTextViewText(R.id.widget_countdown, "days left");
            v.setTextViewText(R.id.widget_checkin, checked ? "Checked in \u2713" : "Check In");
            v.setBoolean(R.id.widget_checkin, "setEnabled", !checked);
        }
        Intent check = new Intent(c, WidgetCheckInReceiver.class); check.setAction(ACTION_CHECK_IN); check.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId); check.putExtra("goal_id", goalId);
        v.setOnClickPendingIntent(R.id.widget_checkin, PendingIntent.getBroadcast(c, widgetId, check, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        Intent open = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        if(open!=null) { PendingIntent launch = PendingIntent.getActivity(c,widgetId+10000,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE); v.setOnClickPendingIntent(R.id.widget_root,launch); v.setOnClickPendingIntent(R.id.widget_title,launch); v.setOnClickPendingIntent(R.id.widget_streak_icon,launch); v.setOnClickPendingIntent(R.id.widget_streak_value,launch); v.setOnClickPendingIntent(R.id.widget_streak_unit,launch); v.setOnClickPendingIntent(R.id.widget_countdown_value,launch); v.setOnClickPendingIntent(R.id.widget_countdown,launch); }
        return v;
    }
    static void update(Context c, AppWidgetManager m, int[] ids, boolean large) { for(int id:ids) m.updateAppWidget(id,create(c,id,large)); }
    static void refresh(Context c, Class<?> provider, boolean large) { AppWidgetManager m=AppWidgetManager.getInstance(c); int[] ids=m.getAppWidgetIds(new ComponentName(c,provider)); update(c,m,ids,large); }
}
