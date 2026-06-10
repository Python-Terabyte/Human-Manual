import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface SendInviteOpts {
  toEmail:      string;
  fromName:     string;
  fromUsername: string;
  message?:     string;
  inviteLink:   string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromAddress: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY') ?? '';
    this.resend      = new Resend(apiKey);
    this.fromAddress = this.config.get<string>('RESEND_FROM_EMAIL')
                    ?? 'Human Manual <invites@humanmanual.app>';
  }

  async sendInvite(opts: SendInviteOpts): Promise<{ ok: boolean; messageId?: string }> {
    const { toEmail, fromName, fromUsername, message, inviteLink } = opts;

    try {
      const { data, error } = await this.resend.emails.send({
        from:    this.fromAddress,
        to:      toEmail,
        subject: `${fromName} invited you to join Human Manual`,
        html:    buildInviteHtml({ fromName, fromUsername, message, inviteLink }),
      });

      if (error) {
        this.logger.error('Resend returned error', error);
        return { ok: false };
      }

      this.logger.log(`Invite email sent → ${toEmail} (id: ${data?.id})`);
      return { ok: true, messageId: data?.id };
    } catch (err) {
      this.logger.error('Failed to send invite email', err);
      return { ok: false };
    }
  }
}

// ─── HTML Template ────────────────────────────────────────────────────────────
function buildInviteHtml(opts: {
  fromName:     string;
  fromUsername: string;
  message?:     string;
  inviteLink:   string;
}): string {
  const { fromName, fromUsername, message, inviteLink } = opts;

  const personalNote = message
    ? `<div style="background:#1e1e2e;border-left:3px solid #6366f1;padding:12px 16px;border-radius:4px;margin:20px 0;">
         <p style="margin:0;color:#a5b4fc;font-style:italic;font-size:14px;">"${escHtml(message)}"</p>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to Human Manual</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;">📖</span>
              <span style="display:inline-block;font-size:20px;font-weight:900;
                           background:linear-gradient(135deg,#6366f1,#8b5cf6);
                           -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                           vertical-align:middle;margin-left:8px;">
                Human Manual
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#12121a;border:1px solid #2a2a3a;border-radius:20px;padding:40px;">

              <!-- Avatar placeholder -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td>
                    <div style="width:56px;height:56px;border-radius:50%;
                                background:linear-gradient(135deg,#6366f1,#8b5cf6);
                                display:inline-flex;align-items:center;justify-content:center;
                                color:#fff;font-size:22px;font-weight:700;">
                      ${escHtml(fromName.charAt(0).toUpperCase())}
                    </div>
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 8px;color:#ffffff;font-size:24px;font-weight:800;line-height:1.3;">
                ${escHtml(fromName)} invited you
              </h1>
              <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;line-height:1.6;">
                <strong style="color:#a5b4fc;">@${escHtml(fromUsername)}</strong> wants you to join
                Human Manual — the platform where people share who they really are.
              </p>

              ${personalNote}

              <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.6;">
                Create your own interactive manual in minutes: share your personality, work style,
                strengths, story, and what makes you <em>you</em>.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);">
                    <a href="${inviteLink}"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;
                              text-decoration:none;font-size:15px;font-weight:700;
                              border-radius:12px;">
                      Accept Invite &amp; Sign Up →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0;color:#475569;font-size:12px;">
                Or copy this link:<br/>
                <a href="${inviteLink}" style="color:#6366f1;word-break:break-all;">${inviteLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;color:#334155;font-size:12px;">
                This invite expires in 7 days. If you didn't expect this email, you can safely ignore it.
              </p>
              <p style="margin:8px 0 0;color:#1e293b;font-size:11px;">
                © ${new Date().getFullYear()} Human Manual
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
