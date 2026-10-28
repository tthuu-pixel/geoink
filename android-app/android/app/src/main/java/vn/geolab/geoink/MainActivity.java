package vn.geolab.geoink;

import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public boolean toanManHinh = true;   // nút "Thu nhỏ vừa khung" trong app tắt / bật

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GoogleDrivePlugin.class);   // đăng nhập Google để đồng bộ Drive
        registerPlugin(CheDoManHinhPlugin.class);  // toàn màn hình / khoá GeoInk
        super.onCreate(savedInstanceState);
        // Giữ màn hình sáng khi đang giảng bài
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        // Cỡ chữ hệ thống không làm vỡ giao diện bảng
        WebView wv = getBridge() != null ? getBridge().getWebView() : null;
        if (wv != null) wv.getSettings().setTextZoom(100);
        apDungManHinh();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) apDungManHinh();
    }

    public void apDungManHinh() { if (toanManHinh) anThanhHeThong(); else hienThanhHeThong(); }

    // Thu nhỏ vừa khung: hiện lại thanh trạng thái và thanh điều hướng
    private void hienThanhHeThong() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.show(WindowInsetsCompat.Type.systemBars());
    }

    // Toàn màn hình: ẩn thanh trạng thái và thanh điều hướng, vuốt từ mép để hiện tạm
    private void anThanhHeThong() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }
}
