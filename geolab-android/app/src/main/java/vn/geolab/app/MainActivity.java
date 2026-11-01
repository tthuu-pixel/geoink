package vn.geolab.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

/**
 * App GeoLab cho máy tính bảng: mở trang nckh-geolab.com toàn màn hình.
 * Đăng nhập, mô hình, khảo sát… chạy đúng như trên trình duyệt; trang web cập nhật thì app cũng mới theo.
 */
public class MainActivity extends Activity {

    private static final String TRANG_CHU = "https://nckh-geolab.com/";
    private static final String TRANG_MAT_MANG = "file:///android_asset/mat-mang.html";

    private WebView web;
    private FrameLayout khung;
    private View manHinhToan;              // phần tử đang toàn màn hình (nút "Toàn MH" trong mô hình)
    private WebChromeClient.CustomViewCallback huyToan;
    private String trangLoi;               // trang không mở được vì mất mạng (để "Thử lại")

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);   // trình chiếu trên lớp: không tắt màn hình

        khung = new FrameLayout(this);
        khung.setBackgroundColor(Color.parseColor("#F4F7FF"));
        web = new WebView(this);
        khung.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(khung);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);        // phiên đăng nhập lưu trong localStorage
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setTextZoom(100);                  // không phóng chữ theo cỡ chữ hệ thống (giữ bố cục mô hình)
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportMultipleWindows(false);
        s.setCacheMode(coMang() ? WebSettings.LOAD_DEFAULT : WebSettings.LOAD_CACHE_ELSE_NETWORK);
        s.setUserAgentString(s.getUserAgentString() + " GeoLabApp/" + phienBan());
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                return moNgoaiNeuCan(req.getUrl());
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest req, WebResourceError loi) {
                if (!req.isForMainFrame()) return;
                trangLoi = req.getUrl().toString();
                v.loadUrl(TRANG_MAT_MANG);
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                if (url != null && url.startsWith("http")) {
                    trangLoi = null;
                    // có mạng lại: lần sau tải bản mới nhất thay vì bản lưu tạm
                    v.getSettings().setCacheMode(coMang() ? WebSettings.LOAD_DEFAULT : WebSettings.LOAD_CACHE_ELSE_NETWORK);
                }
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            // Nút "Toàn màn hình" trong mô hình (requestFullscreen)
            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (manHinhToan != null) { callback.onCustomViewHidden(); return; }
                manHinhToan = view; huyToan = callback;
                khung.addView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                web.setVisibility(View.GONE);
                anThanhHeThong();
            }

            @Override
            public void onHideCustomView() { thoatToan(); }
        });

        // Trang "mất mạng" gọi window.GeoLabApp.thuLai() khi bấm nút Thử lại
        web.addJavascriptInterface(new Object() {
            @android.webkit.JavascriptInterface
            public void thuLai() { runOnUiThread(() -> taiLai()); }
        }, "GeoLabApp");

        if (saved != null) web.restoreState(saved);
        else web.loadUrl(diaChiMo(getIntent()));
        anThanhHeThong();
    }

    // Link nckh-geolab.com mở trong app; link khác (Drive, YouTube, Google…) mở bằng trình duyệt / app tương ứng
    private boolean moNgoaiNeuCan(Uri u) {
        String scheme = u.getScheme() == null ? "" : u.getScheme();
        String host = u.getHost() == null ? "" : u.getHost();
        if (scheme.equals("file")) return false;
        if ((scheme.equals("https") || scheme.equals("http")) && (host.equals("nckh-geolab.com") || host.endsWith(".nckh-geolab.com"))) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (ActivityNotFoundException e) { /* bỏ qua */ }
        return true;
    }

    private String diaChiMo(Intent it) {
        Uri u = it == null ? null : it.getData();
        if (u != null && u.getHost() != null && u.getHost().endsWith("nckh-geolab.com")) return u.toString();
        return TRANG_CHU;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if (intent.getData() != null) web.loadUrl(diaChiMo(intent));
    }

    private void taiLai() {
        web.getSettings().setCacheMode(coMang() ? WebSettings.LOAD_DEFAULT : WebSettings.LOAD_CACHE_ELSE_NETWORK);
        web.loadUrl(trangLoi != null ? trangLoi : TRANG_CHU);
    }

    private boolean coMang() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return true;
        if (Build.VERSION.SDK_INT >= 23) {
            NetworkCapabilities nc = cm.getNetworkCapabilities(cm.getActiveNetwork());
            return nc != null && nc.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
        }
        return true;
    }

    private String phienBan() {
        try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception e) { return "1"; }
    }

    // Toàn màn hình: ẩn thanh trạng thái và thanh điều hướng, vuốt từ mép để hiện tạm
    private void anThanhHeThong() {
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        }
    }

    private void thoatToan() {
        if (manHinhToan == null) return;
        khung.removeView(manHinhToan); manHinhToan = null;
        web.setVisibility(View.VISIBLE);
        if (huyToan != null) { huyToan.onCustomViewHidden(); huyToan = null; }
        anThanhHeThong();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) anThanhHeThong();
    }

    // Nút Quay lại: thoát toàn màn hình → về trang trước → hỏi trước khi thoát app
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (manHinhToan != null) { thoatToan(); return true; }
            if (web.canGoBack()) { web.goBack(); return true; }
            new AlertDialog.Builder(this)
                .setMessage("Thoát GeoLab?")
                .setPositiveButton("Thoát", (d, w) -> finish())
                .setNegativeButton("Ở lại", null)
                .show();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() { super.onPause(); web.onPause(); CookieManager.getInstance().flush(); }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }
}
