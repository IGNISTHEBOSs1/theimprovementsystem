package com.kinetic.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Enable true native edge-to-edge window insets
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    }
}

