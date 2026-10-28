package vn.geolab.geoink;

import android.app.ActivityManager;
import android.content.Context;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Toàn màn hình (ẩn / hiện thanh hệ thống) và khoá GeoInk (ghim ứng dụng: không về màn hình chính,
// không mở ứng dụng khác, không kéo thanh thông báo xuống) cho bản máy tính bảng.
@CapacitorPlugin(name = "CheDoManHinh")
public class CheDoManHinhPlugin extends Plugin {

    @PluginMethod
    public void datToanManHinh(PluginCall call) {
        final boolean toan = Boolean.TRUE.equals(call.getBoolean("toan", true));
        getActivity().runOnUiThread(() -> {
            if (getActivity() instanceof MainActivity) {
                MainActivity a = (MainActivity) getActivity();
                a.toanManHinh = toan;
                a.apDungManHinh();
            }
            JSObject r = new JSObject(); r.put("toan", toan); call.resolve(r);
        });
    }

    @PluginMethod
    public void khoa(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (getActivity() instanceof MainActivity) {   // khoá là bật toàn màn hình luôn (ẩn thanh trạng thái, thanh điều hướng)
                MainActivity a = (MainActivity) getActivity();
                a.toanManHinh = true;
                a.apDungManHinh();
            }
            try { getActivity().startLockTask(); JSObject r = new JSObject(); r.put("khoa", true); call.resolve(r); }
            catch (Exception e) { call.reject("Không khoá được: " + e.getMessage()); }
        });
    }

    @PluginMethod
    public void moKhoa(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try { getActivity().stopLockTask(); } catch (Exception e) { }
            JSObject r = new JSObject(); r.put("khoa", false); call.resolve(r);
        });
    }

    @PluginMethod
    public void trangThai(PluginCall call) {
        ActivityManager am = (ActivityManager) getContext().getSystemService(Context.ACTIVITY_SERVICE);
        boolean dangKhoa = am != null && am.getLockTaskModeState() != ActivityManager.LOCK_TASK_MODE_NONE;
        JSObject r = new JSObject(); r.put("khoa", dangKhoa); call.resolve(r);
    }
}
