package com.streakdown.app;
import android.appwidget.AppWidgetManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
public class WidgetCheckInReceiver extends BroadcastReceiver {
 @Override public void onReceive(Context c, Intent i) {
   String goalId=i.getStringExtra("goal_id"); int id=i.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);
   if(goalId!=null && WidgetStore.checkIn(c,goalId)) { LargeWidgetProvider.refreshAll(c); }
   else if(id!=AppWidgetManager.INVALID_APPWIDGET_ID) { AppWidgetManager m=AppWidgetManager.getInstance(c); if(m.getAppWidgetInfo(id)!=null && m.getAppWidgetInfo(id).provider.getClassName().contains("LargeWidgetProvider")) LargeWidgetProvider.updateOne(c,m,id); else LargeWidgetProvider.updateOne(c,m,id); }
 }
}
