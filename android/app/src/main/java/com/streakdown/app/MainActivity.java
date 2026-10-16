package com.streakdown.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(StreakDownNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
