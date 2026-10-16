package com.streakdown.app;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
public class LargeWidgetProvider extends AppWidgetProvider {
 @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { WidgetViews.update(c,m,ids,true); }
 static void updateOne(Context c, AppWidgetManager m, int id) { m.updateAppWidget(id,WidgetViews.create(c,id,true)); }
 static void refreshAll(Context c) { WidgetViews.refresh(c,LargeWidgetProvider.class,true); }
 @Override public void onDeleted(Context c,int[] ids) { for(int id:ids) WidgetStore.prefs(c).edit().remove(WidgetStore.MAP+id).apply(); }
}
