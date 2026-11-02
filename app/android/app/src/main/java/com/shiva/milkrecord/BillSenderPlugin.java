package com.shiva.milkrecord;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;

/**
 * Opens a chat with the milk seller with the bill ready to send.
 * Android does not let an app send messages by itself (SEND_SMS is restricted on Play),
 * so this opens WhatsApp on the seller's chat with the bill image attached, or the SMS
 * app with the summary filled in; the person taps send.
 */
@CapacitorPlugin(name = "BillSender")
public class BillSenderPlugin extends Plugin {

    private static final String[] WHATSAPP_PACKAGES = { "com.whatsapp", "com.whatsapp.w4b" };

    @PluginMethod
    public void send(PluginCall call) {
        String phone = call.getString("phone", "").replaceAll("[^0-9]", "");
        String text = call.getString("text", "");
        String via = call.getString("via", "whatsapp");
        String path = call.getString("path");
        if (phone.isEmpty()) {
            call.reject("No phone number", "NO_PHONE");
            return;
        }
        Context ctx = getContext();
        try {
            Intent intent;
            if ("sms".equals(via)) {
                intent = new Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:" + phone));
                intent.putExtra("sms_body", text);
            } else {
                String pkg = installedWhatsApp(ctx);
                if (pkg == null) {
                    call.reject("WhatsApp is not installed", "NO_WHATSAPP");
                    return;
                }
                intent = new Intent(Intent.ACTION_SEND);
                intent.setPackage(pkg);
                intent.putExtra("jid", phone + "@s.whatsapp.net");
                intent.putExtra(Intent.EXTRA_TEXT, text);
                if (path != null) {
                    File file = new File(Uri.parse(path).getPath());
                    Uri uri = FileProvider.getUriForFile(ctx, ctx.getPackageName() + ".fileprovider", file);
                    intent.setType("image/png");
                    intent.putExtra(Intent.EXTRA_STREAM, uri);
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                } else {
                    intent.setType("text/plain");
                }
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException e) {
            call.reject("No app can send this", "NO_APP");
        } catch (Exception e) {
            call.reject(e.getMessage(), "FAILED");
        }
    }

    private static String installedWhatsApp(Context ctx) {
        PackageManager pm = ctx.getPackageManager();
        for (String pkg : WHATSAPP_PACKAGES) {
            try {
                pm.getPackageInfo(pkg, 0);
                return pkg;
            } catch (PackageManager.NameNotFoundException ignored) {
                // try the next one
            }
        }
        return null;
    }
}
