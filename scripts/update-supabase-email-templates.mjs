const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]
  : 'nmftzlavysnpwzcjbwlz';

function generateConfirmationTemplate() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Virtue &amp; Co. Webworks</title>
  </head>
  <body style="margin:0;padding:0;background:#F5F4F0;font-family:'Instrument Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#0A0A0A;">
    <!-- Hidden preview preheader -->
    <div style="display:none;font-size:1px;color:#F5F4F0;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      Your 6-digit account verification code is {{ .Token }}. Do not share this code.
    </div>

    <!-- Outer Warm Bone Canvas -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:36px 14px 48px;">
      <tr>
        <td align="center">
          <!-- Main Architectural Card -->
          <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #E5E3DC;box-shadow:0 8px 30px rgba(10,10,10,0.04);">
            <tr>
              <td style="padding:24px 30px 20px;border-bottom:1px solid #EAE8E2;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:36px;height:36px;background:#0A0A0A;border-radius:10px;text-align:center;vertical-align:middle;">
                            <img src="https://virtuecowebworks.solutions/brand/logo-mark.png" width="22" height="22" alt="Virtue &amp; Co." style="display:inline-block;width:22px;height:22px;object-fit:contain;vertical-align:middle;" />
                          </td>
                          <td style="padding-left:12px;vertical-align:middle;">
                            <div style="font-family:'Inter',sans-serif;font-size:14px;font-weight:700;letter-spacing:-0.02em;color:#0A0A0A;line-height:1.1;">
                              VIRTUE <span style="color:#DCAA28;">&amp;</span> CO.
                            </div>
                            <div style="font-size:9.5px;font-weight:600;letter-spacing:0.18em;color:#85837D;text-transform:uppercase;margin-top:2px;">
                              WEBWORKS
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="font-family:'SF Mono',Consolas,monospace;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#85837D;">
                        ( &nbsp;Verification&nbsp; )
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Hero Work Preview Image -->
            <tr>
              <td style="padding:24px 30px 0;">
                <img src="https://virtuecowebworks.solutions/work/aurum-hero.jpg" alt="Client Workspace" width="520" style="width:100%;max-width:520px;height:auto;border-radius:14px;display:block;border:1px solid #EAE8E2;object-fit:cover;" />
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding:32px 30px 36px;text-align:left;">
                <h1 style="font-family:'Inter',sans-serif;font-size:26px;font-weight:600;color:#0A0A0A;line-height:1.2;margin:0 0 10px;letter-spacing:-0.025em;">
                  Your verification code.
                </h1>
                <p style="font-size:15px;color:#52514D;font-weight:400;line-height:1.65;margin:0 0 18px;">
                  Enter this 6-digit code in your browser to activate your client workspace.
                </p>

                <!-- 6-Digit Code Box -->
                <div style="text-align:center;margin:24px 0 26px;">
                  <div style="display:inline-block;background:#FAF9F6;border:1.5px solid #DFDDD6;border-radius:14px;padding:16px 36px;box-shadow:0 4px 16px rgba(10,10,10,0.03);">
                    <span style="font-family:'SF Mono',Consolas,Menlo,monospace;font-size:36px;font-weight:700;letter-spacing:14px;color:#0A0A0A;padding-left:14px;display:inline-block;">
                      {{ .Token }}
                    </span>
                  </div>
                  <div style="font-size:12px;color:#85837D;margin-top:10px;font-weight:500;">
                    Code is valid for 60 minutes · Never share this code with anyone
                  </div>
                </div>

                <!-- Security Alert Box -->
                <div style="background:#FAF9F6;border:1px solid #E5E1D5;border-radius:14px;padding:16px 20px;text-align:left;margin:22px 0 18px;">
                  <div style="font-family:'SF Mono',Consolas,monospace;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#0A0A0A;margin-bottom:6px;">
                    Security Notice
                  </div>
                  <div style="font-size:13px;color:#52514D;line-height:1.6;">
                    If you did not initiate this account creation on Virtue &amp; Co. Webworks, you can safely ignore this email. No account will be activated without this code.
                  </div>
                </div>

                <div style="height:1px;background:#EAE8E2;margin:24px 0;"></div>

                <div style="font-size:12px;color:#85837D;text-align:left;line-height:1.6;">
                  Automated security verification from Virtue &amp; Co. Webworks. Need help? Contact <a href="mailto:virtueco.dev@gmail.com" style="color:#0A0A0A;font-weight:600;">virtueco.dev@gmail.com</a>.
                </div>
              </td>
            </tr>
          </table>

          <!-- Footer Area -->
          <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;margin-top:26px;text-align:center;">
            <tr>
              <td style="font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#B8922A;padding-bottom:8px;">
                ( &nbsp;&nbsp;&nbsp;Thoughtful design. Built on schedule.&nbsp;&nbsp;&nbsp; )
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#85837D;padding-bottom:6px;">
                © 2026 Virtue &amp; Co. Webworks. All rights reserved.
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#85837D;">
                <a href="mailto:virtueco.dev@gmail.com" style="color:#0A0A0A;text-decoration:none;font-weight:500;">virtueco.dev@gmail.com</a>
                &nbsp;·&nbsp;
                <span style="color:#0A0A0A;font-weight:500;">+234 916 804 7236</span>
                &nbsp;·&nbsp;
                <a href="https://virtuecowebworks.solutions" style="color:#0A0A0A;text-decoration:none;font-weight:500;">virtuecowebworks.solutions</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function generateRecoveryTemplate() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Virtue &amp; Co. Webworks</title>
  </head>
  <body style="margin:0;padding:0;background:#F5F4F0;font-family:'Instrument Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#0A0A0A;">
    <!-- Hidden preview preheader -->
    <div style="display:none;font-size:1px;color:#F5F4F0;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      Your 6-digit password reset code is {{ .Token }}. Do not share this code.
    </div>

    <!-- Outer Warm Bone Canvas -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:36px 14px 48px;">
      <tr>
        <td align="center">
          <!-- Main Architectural Card -->
          <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #E5E3DC;box-shadow:0 8px 30px rgba(10,10,10,0.04);">
            <tr>
              <td style="padding:24px 30px 20px;border-bottom:1px solid #EAE8E2;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:36px;height:36px;background:#0A0A0A;border-radius:10px;text-align:center;vertical-align:middle;">
                            <img src="https://virtuecowebworks.solutions/brand/logo-mark.png" width="22" height="22" alt="Virtue &amp; Co." style="display:inline-block;width:22px;height:22px;object-fit:contain;vertical-align:middle;" />
                          </td>
                          <td style="padding-left:12px;vertical-align:middle;">
                            <div style="font-family:'Inter',sans-serif;font-size:14px;font-weight:700;letter-spacing:-0.02em;color:#0A0A0A;line-height:1.1;">
                              VIRTUE <span style="color:#DCAA28;">&amp;</span> CO.
                            </div>
                            <div style="font-size:9.5px;font-weight:600;letter-spacing:0.18em;color:#85837D;text-transform:uppercase;margin-top:2px;">
                              WEBWORKS
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="font-family:'SF Mono',Consolas,monospace;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#85837D;">
                        ( &nbsp;Password Reset&nbsp; )
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Hero Work Preview Image -->
            <tr>
              <td style="padding:24px 30px 0;">
                <img src="https://virtuecowebworks.solutions/work/aurum-hero.jpg" alt="Client Workspace" width="520" style="width:100%;max-width:520px;height:auto;border-radius:14px;display:block;border:1px solid #EAE8E2;object-fit:cover;" />
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding:32px 30px 36px;text-align:left;">
                <h1 style="font-family:'Inter',sans-serif;font-size:26px;font-weight:600;color:#0A0A0A;line-height:1.2;margin:0 0 10px;letter-spacing:-0.025em;">
                  Reset your password.
                </h1>
                <p style="font-size:15px;color:#52514D;font-weight:400;line-height:1.65;margin:0 0 18px;">
                  We received a request to reset the password for your Virtue &amp; Co. Webworks account.
                </p>

                <!-- 6-Digit Code Box -->
                <div style="text-align:center;margin:24px 0 26px;">
                  <div style="display:inline-block;background:#FAF9F6;border:1.5px solid #DFDDD6;border-radius:14px;padding:16px 36px;box-shadow:0 4px 16px rgba(10,10,10,0.03);">
                    <span style="font-family:'SF Mono',Consolas,Menlo,monospace;font-size:36px;font-weight:700;letter-spacing:14px;color:#0A0A0A;padding-left:14px;display:inline-block;">
                      {{ .Token }}
                    </span>
                  </div>
                  <div style="font-size:12px;color:#85837D;margin-top:10px;font-weight:500;">
                    Code is valid for 60 minutes · Never share this code with anyone
                  </div>
                </div>

                <!-- Security Alert Box -->
                <div style="background:#FAF9F6;border:1px solid #E5E1D5;border-radius:14px;padding:16px 20px;text-align:left;margin:22px 0 18px;">
                  <div style="font-family:'SF Mono',Consolas,monospace;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#0A0A0A;margin-bottom:6px;">
                    Security Notice
                  </div>
                  <div style="font-size:13px;color:#52514D;line-height:1.6;">
                    If you did not request a password reset, you can safely ignore this email and your existing password will remain active.
                  </div>
                </div>

                <div style="height:1px;background:#EAE8E2;margin:24px 0;"></div>

                <div style="font-size:12px;color:#85837D;text-align:left;line-height:1.6;">
                  Automated security verification from Virtue &amp; Co. Webworks. Need help? Contact <a href="mailto:virtueco.dev@gmail.com" style="color:#0A0A0A;font-weight:600;">virtueco.dev@gmail.com</a>.
                </div>
              </td>
            </tr>
          </table>

          <!-- Footer Area -->
          <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;margin-top:26px;text-align:center;">
            <tr>
              <td style="font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#B8922A;padding-bottom:8px;">
                ( &nbsp;&nbsp;&nbsp;Thoughtful design. Built on schedule.&nbsp;&nbsp;&nbsp; )
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#85837D;padding-bottom:6px;">
                © 2026 Virtue &amp; Co. Webworks. All rights reserved.
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#85837D;">
                <a href="mailto:virtueco.dev@gmail.com" style="color:#0A0A0A;text-decoration:none;font-weight:500;">virtueco.dev@gmail.com</a>
                &nbsp;·&nbsp;
                <span style="color:#0A0A0A;font-weight:500;">+234 916 804 7236</span>
                &nbsp;·&nbsp;
                <a href="https://virtuecowebworks.solutions" style="color:#0A0A0A;text-decoration:none;font-weight:500;">virtuecowebworks.solutions</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function updateSupabaseTemplates() {
  console.log('Updating Supabase Auth configuration...');
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mailer_otp_length: 6,
      mailer_subjects_confirmation: 'Your 6-Digit Verification Code — Virtue & Co. Webworks',
      mailer_templates_confirmation_content: generateConfirmationTemplate(),
      mailer_subjects_recovery: 'Your 6-Digit Password Reset Code — Virtue & Co. Webworks',
      mailer_templates_recovery_content: generateRecoveryTemplate(),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update auth config (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  console.log('✅ Successfully updated Supabase Auth configuration:');
  console.log('  - mailer_otp_length:', data.mailer_otp_length);
  console.log('  - confirmation subject:', data.mailer_subjects_confirmation);
  console.log('  - recovery subject:', data.mailer_subjects_recovery);
  console.log('  - custom confirmation template set: true');
  console.log('  - custom recovery template set: true');
}

updateSupabaseTemplates().catch(console.error);
