package vn.geolab.geoink;

import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Giữ màn hình sáng khi đang giảng bài
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        // Cỡ chữ hệ thống không làm vỡ giao diện bảng
        WebView wv = getBridge() != null ? getBridge().getWebView() : null;
        if (wv != null) wv.getSettings().setTextZoom(100);
        anThanhHeThong();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) anThanhHeThong();
    }

    // Toàn màn hình: ẩn thanh trạng thái và thanh điều hướng, vuốt từ mép để hiện tạm
    private void anThanhHeThong() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }
}
