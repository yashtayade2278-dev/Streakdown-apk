package com.streakdown.app;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import java.util.Calendar;
public class LargeWidgetProvider extends AppWidgetProvider {
 static final String ACTION_MIDNIGHT = "com.streakdown.app.WIDGET_MIDNIGHT";
 @Override public void onReceive(Context c, Intent i) {
   super.onReceive(c, i);
   String a = i == null ? null : i.getAction();
   if (Intent.ACTION_DATE_CHANGED.equals(a) || Intent.ACTION_TIME_CHANGED.equals(a) || Intent.ACTION_TIMEZONE_CHANGED.equals(a)
       || Intent.ACTION_BOOT_COMPLETED.equals(a) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(a) || ACTION_MIDNIGHT.equals(a)) {
     refreshAll(c); scheduleMidnight(c);
   }
 }
 @Override public void onEnabled(Context c) { scheduleMidnight(c); }
 @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { WidgetViews.update(c,m,ids,true); scheduleMidnight(c); }
 static void updateOne(Context c, AppWidgetManager m, int id) { m.updateAppWidget(id,WidgetViews.create(c,id,true)); }
 static void refreshAll(Context c) { WidgetViews.refresh(c,LargeWidgetProvider.class,true); }
 // Wake just after local midnight so the widget rolls over to the new day on its own.
 static void scheduleMidnight(Context c) {
   try {
     AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
     Intent in = new Intent(c, LargeWidgetProvider.class).setAction(ACTION_MIDNIGHT);
     PendingIntent pi = PendingIntent.getBroadcast(c, 7001, in, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
     Calendar cal = Calendar.getInstance(); cal.add(Calendar.DAY_OF_YEAR, 1);
     cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 5); cal.set(Calendar.MILLISECOND, 0);
     if (am != null) am.setAndAllowWhileIdle(AlarmManager.RTC, cal.getTimeInMillis(), pi);
   } catch (Exception ignored) {}
 }
 @Override public void onDeleted(Context c,int[] ids) { for(int id:ids) WidgetStore.prefs(c).edit().remove(WidgetStore.MAP+id).apply(); }
}
