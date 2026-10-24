package vn.geolab.geoink;

import android.app.Activity;
import android.app.PendingIntent;

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
