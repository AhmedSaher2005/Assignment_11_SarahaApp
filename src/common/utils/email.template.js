export const emailTemplate = (otp) => {
  return `<!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    
    <body style="margin:0;padding:0;background-color:#f3f0ff;font-family:Arial,Tahoma,sans-serif;">
    
      <div style="padding:35px 12px;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px 24px;text-align:center;">
    
          <div style="background:#7555d9;color:#ffffff;width:60px;height:60px;line-height:60px;border-radius:18px;margin:0 auto 12px;font-size:28px;font-weight:bold;">
            S
          </div>
    
          <h1 style="color:#35235f;margin:0;font-size:28px;">
            صراحة
          </h1>
    
          <p style="color:#81739f;font-size:12px;letter-spacing:4px;margin-top:6px;">
            SARAHA
          </p>
    
          <div style="height:1px;background:#eae5f5;margin:26px 0;"></div>
    
          <h2 style="color:#29213b;font-size:23px;">
            أهلًا بيك 👋
          </h2>
    
          <p style="color:#655d75;font-size:15px;line-height:1.9;">
            استخدم كود التحقق التالي لتأكيد بريدك الإلكتروني وإكمال إنشاء حسابك في صراحة.
          </p>
    
          <div style="background:#f5f1ff;border-radius:14px;padding:24px 12px;margin:24px 0;">
    
            <p style="color:#75659b;margin:0 0 14px;">
              كود التحقق الخاص بك
            </p>
    
            <div dir="ltr" style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#6844c5;">
              ${otp}
            </div>
    
            <p style="color:#75659b;font-size:12px;margin:16px 0 0;">
              الكود صالح لمدة 5 دقائق
            </p>
    
          </div>
    
          <p style="color:#655d75;font-size:13px;line-height:1.9;">
            حفاظًا على أمان حسابك، متشاركش الكود مع أي حد. لو إنت مطلبتش الكود ده، تجاهل الرسالة.
          </p>
    
          <div style="height:1px;background:#eae5f5;margin:26px 0 18px;"></div>
    
          <p style="color:#8a8299;font-size:12px;">
            © 2026 Saraha · كل الحقوق محفوظة
          </p>
    
        </div>
      </div>
    
    </body>
    </html>
    ;
    
    await sendEmail({
        to: email,
        subject: "كود التحقق الخاص بك | صراحة",
        html
    });`;
};
