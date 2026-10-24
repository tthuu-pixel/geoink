package vn.geolab.geoink;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.net.Uri;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContracts;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.identity.AuthorizationRequest;
import com.google.android.gms.auth.api.identity.AuthorizationResult;
import com.google.android.gms.auth.api.identity.Identity;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Scope;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

/**
 * Đăng nhập Google để đồng bộ thư viện sổ với Google Drive của giáo viên.
 * Dùng Google Identity Services (AuthorizationClient): chỉ xin quyền drive.file (tệp do GeoInk tạo) và email.
 * Google nhận ra app nhờ tên gói vn.geolab.geoink + vân tay SHA-1 của khoá ký (khai báo trong Google Cloud).
 */
@CapacitorPlugin(name = "GoogleDrive")
public class GoogleDrivePlugin extends Plugin {
    private static final List<Scope> PHAM_VI = Arrays.asList(
        new Scope("https://www.googleapis.com/auth/drive.file"),
        new Scope("https://www.googleapis.com/auth/userinfo.email")
    );
    private ActivityResultLauncher<IntentSenderRequest> hopDangNhap;
    private PluginCall dangCho;

    @Override
    public void load() {
        hopDangNhap = getActivity().registerForActivityResult(new ActivityResultContracts.StartIntentSenderForResult(), kq -> {
            PluginCall call = dangCho;
            dangCho = null;
            if (call == null) return;
            if (kq.getResultCode() != Activity.RESULT_OK) {
                call.reject("Đã huỷ đăng nhập Google", "HUY");
                return;
            }
            try {
                AuthorizationResult r = Identity.getAuthorizationClient(getActivity()).getAuthorizationResultFromIntent(kq.getData());
                traToken(call, r);
            } catch (ApiException e) {
                call.reject("Không đăng nhập được Google (" + e.getStatusCode() + ")", "LOI");
            }
        });
    }

    /** Lấy mã truy cập Google Drive. hoi = true: được phép hiện hộp chọn tài khoản / xin quyền. */
    @PluginMethod
    public void layToken(PluginCall call) {
        final boolean hoi = Boolean.TRUE.equals(call.getBoolean("hoi", false));
        AuthorizationRequest yc = AuthorizationRequest.builder().setRequestedScopes(PHAM_VI).build();
        Identity.getAuthorizationClient(getActivity()).authorize(yc)
            .addOnSuccessListener(r -> {
                if (r.hasResolution()) {
                    PendingIntent pi = r.getPendingIntent();
                    if (!hoi || pi == null) {
                        call.reject("Cần đăng nhập Google", "CAN_DANG_NHAP");
                        return;
                    }
                    dangCho = call;
                    getActivity().runOnUiThread(() -> hopDangNhap.launch(new IntentSenderRequest.Builder(pi.getIntentSender()).build()));
                } else {
                    traToken(call, r);
                }
            })
            .addOnFailureListener(e -> call.reject("Không đăng nhập được Google: " + e.getMessage(), "LOI"));
    }

    /**
     * Đăng nhập Google bằng trình duyệt (máy không có Google Play Services chính hãng).
     * Mở trang đăng nhập trong trình duyệt; Google trả mã về http://127.0.0.1:<cổng> do app lắng nghe (giống bản Windows).
     * Trang trả về tự chuyển sang geoink://dong-bo để quay lại GeoInk.
     */
    @PluginMethod
    public void dangNhapTrinhDuyet(PluginCall call) {
        final String url = call.getString("url");
        if (url == null || !url.startsWith("https://accounts.google.com/")) {
            call.reject("Địa chỉ đăng nhập không hợp lệ", "LOI");
            return;
        }
        new Thread(() -> {
            try (ServerSocket ss = new ServerSocket(0, 4, InetAddress.getByName("127.0.0.1"))) {
                ss.setSoTimeout(5 * 60 * 1000);
                String veLai = "http://127.0.0.1:" + ss.getLocalPort();
                Intent mo = new Intent(Intent.ACTION_VIEW, Uri.parse(url + "&redirect_uri=" + Uri.encode(veLai)));
                mo.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getActivity().startActivity(mo);
                while (true) {
                    try (Socket s = ss.accept()) {
                        s.setSoTimeout(15000);
                        BufferedReader r = new BufferedReader(new InputStreamReader(s.getInputStream(), StandardCharsets.UTF_8));
                        String dong = r.readLine();
                        String[] phan = dong == null ? new String[0] : dong.split(" ");
                        String duong = phan.length > 1 ? phan[1] : "";
                        if (!duong.startsWith("/?")) { traLoi(s, "404 Not Found", ""); continue; }
                        Uri u = Uri.parse("http://127.0.0.1" + duong);
                        String ma = u.getQueryParameter("code");
                        traLoi(s, "200 OK", trangKetQua(ma != null));
                        JSObject kq = new JSObject();
                        kq.put("code", ma);
                        kq.put("error", u.getQueryParameter("error"));
                        kq.put("state", u.getQueryParameter("state"));
                        kq.put("redirect", veLai);
                        call.resolve(kq);
                        return;
                    }
                }
            } catch (SocketTimeoutException e) {
                call.reject("Hết thời gian chờ đăng nhập Google", "HET_GIO");
            } catch (Exception e) {
                call.reject("Không mở được đăng nhập Google: " + e.getMessage(), "LOI");
            }
        }).start();
    }

    private static void traLoi(Socket s, String trangThai, String html) throws java.io.IOException {
        byte[] than = html.getBytes(StandardCharsets.UTF_8);
        OutputStream o = s.getOutputStream();
        o.write(("HTTP/1.1 " + trangThai + "\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: " + than.length + "\r\nConnection: close\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        o.write(than);
        o.flush();
    }

    private static String trangKetQua(boolean ok) {
        return "<!doctype html><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>GeoInk</title>"
            + "<body style=\"font-family:Roboto,Arial,sans-serif;background:#EEF5FF;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0\">"
            + "<div style=\"background:#fff;padding:28px 32px;border-radius:16px;box-shadow:0 10px 30px rgba(30,64,175,.15);text-align:center;max-width:420px\">"
            + "<h2 style=\"color:" + (ok ? "#1E3A8A" : "#B91C1C") + "\">" + (ok ? "Đã kết nối Google Drive" : "Chưa kết nối Google Drive") + "</h2>"
            + "<p>Quay lại GeoInk để tiếp tục.</p>"
            + "<a href=\"geoink://dong-bo\" style=\"display:inline-block;margin-top:8px;padding:12px 22px;border-radius:24px;background:#1E40AF;color:#fff;text-decoration:none;font-weight:600\">Quay lại GeoInk</a>"
            + "</div><script>setTimeout(function(){location.href='geoink://dong-bo'},400)</script></body>";
    }

    private void traToken(PluginCall call, AuthorizationResult r) {
        String token = r.getAccessToken();
        if (token == null) {
            call.reject("Google không trả mã truy cập", "LOI");
            return;
        }
        JSObject kq = new JSObject();
        kq.put("token", token);
        call.resolve(kq);
    }
}
