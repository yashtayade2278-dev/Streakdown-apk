package com.streakdown.app;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ImageView;
import android.widget.ScrollView;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;

/** Warm, branded goal picker shown when a Kairo home-screen widget is added. */
public class WidgetConfigureActivity extends Activity {
    private int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private final int ink = Color.rgb(43, 43, 43);
    private final int muted = Color.rgb(111, 100, 91);
    private final int coral = Color.rgb(230, 106, 76);
    private final int cream = Color.rgb(255, 248, 238);
    private final int border = Color.rgb(239, 218, 198);

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        getWindow().setStatusBarColor(cream);
        getWindow().setNavigationBarColor(cream);
        getWindow().getDecorView().setBackgroundColor(cream);
        setResult(RESULT_CANCELED);
        appWidgetId = getIntent().getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);

        LinearLayout page = new LinearLayout(this);
        page.setOrientation(LinearLayout.VERTICAL);
        page.setPadding(dp(20), dp(20), dp(20), dp(18));
        page.setBackgroundColor(cream);

        LinearLayout hero = new LinearLayout(this);
        hero.setGravity(Gravity.CENTER_VERTICAL);
        hero.setOrientation(LinearLayout.HORIZONTAL);
        hero.setPadding(dp(16), dp(16), dp(16), dp(16));
        hero.setBackground(gradient(new int[]{Color.rgb(255, 241, 219), Color.rgb(255, 226, 216), Color.rgb(250, 224, 235)}, dp(24)));
        ImageView mark = new ImageView(this);
        mark.setImageResource(R.drawable.kairo_logo_tile); // same gradient tile + logo as the app icon
        LinearLayout.LayoutParams mp = new LinearLayout.LayoutParams(dp(56), dp(56)); mp.rightMargin = dp(14);
        hero.addView(mark, mp);
        LinearLayout brandColumn = new LinearLayout(this); brandColumn.setOrientation(LinearLayout.VERTICAL);
        brandColumn.addView(text("Kairo", 25, ink, true));
        TextView tagline = text("Make Today Count.", 14, coral, false);
        LinearLayout.LayoutParams tp = new LinearLayout.LayoutParams(-2, -2); tp.topMargin = dp(3); brandColumn.addView(tagline, tp);
        hero.addView(brandColumn, new LinearLayout.LayoutParams(0, -2, 1));
        page.addView(hero, new LinearLayout.LayoutParams(-1, -2));

        TextView heading = text("Choose a goal for this widget", 21, ink, true);
        LinearLayout.LayoutParams hp = new LinearLayout.LayoutParams(-1, -2); hp.topMargin = dp(24);
        page.addView(heading, hp);
        TextView sub = text("Select what you want to see on your home screen. Your streak and countdown will stay close at hand.", 14, muted, false);
        sub.setLineSpacing(dp(2), 1f);
        LinearLayout.LayoutParams sp = new LinearLayout.LayoutParams(-1, -2); sp.topMargin = dp(6); sp.bottomMargin = dp(16);
        page.addView(sub, sp);

        ScrollView scroll = new ScrollView(this);
        LinearLayout choices = new LinearLayout(this); choices.setOrientation(LinearLayout.VERTICAL);
        JSONArray goals = WidgetStore.getGoals(this);
        if (goals.length() == 0) {
            LinearLayout empty = new LinearLayout(this); empty.setOrientation(LinearLayout.VERTICAL); empty.setPadding(dp(18), dp(18), dp(18), dp(18));
            empty.setBackground(solid(Color.rgb(255, 253, 249), dp(20), border));
            empty.addView(text("No goals yet", 18, ink, true));
            TextView explanation = text("Create your first goal in Kairo, then add a widget to track it here. Kairo never adds sample goals automatically.", 14, muted, false);
            explanation.setLineSpacing(dp(2), 1f); LinearLayout.LayoutParams ep = new LinearLayout.LayoutParams(-1, -2); ep.topMargin = dp(8); empty.addView(explanation, ep);
            Button open = actionButton("Open Kairo", true); LinearLayout.LayoutParams op = new LinearLayout.LayoutParams(-1, dp(50)); op.topMargin = dp(18); empty.addView(open, op);
            open.setOnClickListener(v -> { Intent launch = getPackageManager().getLaunchIntentForPackage(getPackageName()); if (launch != null) startActivity(launch); finish(); });
            choices.addView(empty);
        } else {
            int[] colors = {Color.rgb(255, 241, 219), Color.rgb(252, 230, 238), Color.rgb(230, 241, 255), Color.rgb(248, 238, 221)};
            for (int i = 0; i < goals.length(); i++) {
                JSONObject goal = goals.optJSONObject(i); if (goal == null) continue;
                final String id = goal.optString("id");
                String name = goal.optString("title", "Untitled goal");
                LinearLayout choice = new LinearLayout(this); choice.setGravity(Gravity.CENTER_VERTICAL); choice.setOrientation(LinearLayout.HORIZONTAL); choice.setPadding(dp(14), dp(12), dp(14), dp(12));
                choice.setBackground(solid(colors[i % colors.length], dp(18), border));
                ImageView dot = new ImageView(this); dot.setImageResource(R.drawable.kairo_logo_tile_small); LinearLayout.LayoutParams dpv = new LinearLayout.LayoutParams(dp(34), dp(34)); dpv.rightMargin = dp(12); choice.addView(dot, dpv);
                LinearLayout labels = new LinearLayout(this); labels.setOrientation(LinearLayout.VERTICAL);
                labels.addView(text(name, 15, ink, true));
                String desc = goal.optString("description", "").trim();
                String target = goal.optString("targetDate", "");
                String subline = desc.isEmpty() ? "Track your streak and target date" : desc;
                TextView detail = text(subline, 12, muted, false); detail.setMaxLines(2); LinearLayout.LayoutParams dl = new LinearLayout.LayoutParams(-1, -2); dl.topMargin = dp(3); labels.addView(detail, dl);
                choice.addView(labels, new LinearLayout.LayoutParams(0, -2, 1));
                TextView arrow = text("›", 28, coral, false); choice.addView(arrow);
                LinearLayout.LayoutParams cp = new LinearLayout.LayoutParams(-1, -2); cp.bottomMargin = dp(10); choices.addView(choice, cp);
                choice.setOnClickListener(v -> configure(id));
            }
        }
        scroll.addView(choices);
        LinearLayout.LayoutParams scrollParams = new LinearLayout.LayoutParams(-1, 0, 1f); scrollParams.topMargin = dp(4);
        page.addView(scroll, scrollParams);
        setContentView(page);
    }

    private void configure(String goalId) {
        WidgetStore.setGoalForWidget(this, appWidgetId, goalId);
        AppWidgetManager manager = AppWidgetManager.getInstance(this);
        android.appwidget.AppWidgetProviderInfo info = manager.getAppWidgetInfo(appWidgetId);
        if (info != null && info.provider.getClassName().contains("LargeWidgetProvider")) LargeWidgetProvider.updateOne(this, manager, appWidgetId);
        else LargeWidgetProvider.updateOne(this, manager, appWidgetId);
        Intent result = new Intent(); result.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        setResult(RESULT_OK, result); finish();
    }

    private TextView text(String value, float size, int color, boolean bold) {
        TextView view = new TextView(this); view.setText(value); view.setTextSize(size); view.setTextColor(color);
        if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD); return view;
    }
    private Button actionButton(String value, boolean primary) {
        Button button = new Button(this); button.setText(value); button.setTextSize(14); button.setAllCaps(false); button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        button.setTextColor(primary ? ink : ink); button.setPadding(dp(16), 0, dp(16), 0);
        button.setBackground(primary ? gradient(new int[]{Color.rgb(255, 216, 154), Color.rgb(255, 181, 154), Color.rgb(245, 168, 195)}, dp(16)) : solid(Color.WHITE, dp(16), border)); return button;
    }
    private GradientDrawable gradient(int[] colors, int radius) { GradientDrawable d = new GradientDrawable(GradientDrawable.Orientation.LEFT_RIGHT, colors); d.setCornerRadius(radius); return d; }
    private GradientDrawable solid(int color, int radius, int stroke) { GradientDrawable d = new GradientDrawable(); d.setColor(color); d.setCornerRadius(radius); d.setStroke(dp(1), stroke); return d; }
    private int dp(int value) { return (int)(value * getResources().getDisplayMetrics().density + 0.5f); }
}
