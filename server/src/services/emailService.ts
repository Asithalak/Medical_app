import { Resend } from 'resend';

interface ConsultationEmailData {
  patientEmail: string;
  patientName: string;
  trackingCode?: string;
  consultationType?: string;
  diagnosis?: string | null;
  prescription?: string | null;
  recommendations?: string | null;
  followUpNotes?: string | null;
  consultationLink?: string | null;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Generates a clean, professional medical consultation summary HTML email
 */
function buildConsultationEmailHtml(data: ConsultationEmailData): string {
  const {
    patientName,
    trackingCode,
    consultationType,
    diagnosis,
    prescription,
    recommendations,
    followUpNotes,
    consultationLink,
  } = data;

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultation Summary - MediLanka</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f6f8;
      padding: 30px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 620px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      padding: 32px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 14px;
      opacity: 0.92;
    }
    .content {
      padding: 32px 30px;
    }
    .badge-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .tracking-tag {
      font-family: monospace;
      font-weight: 700;
      color: #0284c7;
      background: #e0f2fe;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .section-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 6px;
    }
    .card-block {
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #0284c7;
      padding: 14px 18px;
      margin-bottom: 18px;
    }
    .card-block.rx {
      border-left-color: #10b981;
      background: #f0fdf4;
    }
    .card-block.advice {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    .card-content {
      white-space: pre-wrap;
      font-size: 14.5px;
      color: #1e293b;
      margin: 0;
    }
    .link-box {
      background: #eff6ff;
      border: 1px dashed #3b82f6;
      border-radius: 8px;
      padding: 18px;
      text-align: center;
      margin: 24px 0;
    }
    .btn {
      display: inline-block;
      background: #0284c7;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      margin-top: 10px;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 30px;
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }
    .emergency-box {
      margin-top: 12px;
      padding: 8px 12px;
      background: #fef2f2;
      border-radius: 6px;
      color: #991b1b;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>MediLanka / Embassy Aid Connect</h1>
        <p>Medical Consultation Summary & Prescription</p>
      </div>

      <div class="content">
        <p style="font-size: 16px; margin-top: 0;">Dear <strong>${patientName || 'Patient'}</strong>,</p>
        <p style="color: #475569; font-size: 14px;">
          Thank you for your consultation with our medical team. Below is the clinical summary and medical guidance recorded by your consulting doctor.
        </p>

        <div class="badge-bar">
          <div><strong>Date:</strong> ${dateStr}</div>
          ${trackingCode ? `<div><strong>Tracking:</strong> <span class="tracking-tag">${trackingCode}</span></div>` : ''}
        </div>

        ${consultationType ? `
        <p style="font-size: 13px; color: #64748b; margin-top: -12px; margin-bottom: 20px;">
          Consultation Type: <strong>${consultationType}</strong>
        </p>
        ` : ''}

        ${diagnosis ? `
        <div class="section-title">Diagnosis & Clinical Assessment</div>
        <div class="card-block">
          <p class="card-content">${diagnosis}</p>
        </div>
        ` : ''}

        ${prescription ? `
        <div class="section-title">Prescription & Medications</div>
        <div class="card-block rx">
          <p class="card-content">${prescription}</p>
        </div>
        ` : ''}

        ${recommendations ? `
        <div class="section-title">Doctor's Recommendations & Advice</div>
        <div class="card-block advice">
          <p class="card-content">${recommendations}</p>
        </div>
        ` : ''}

        ${followUpNotes ? `
        <div class="section-title">Follow-up Notes & Instructions</div>
        <div class="card-block">
          <p class="card-content">${followUpNotes}</p>
        </div>
        ` : ''}

        ${consultationLink ? `
        <div class="link-box">
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e3a8a;">
            Live Consultation Video / Meeting Link
          </p>
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #475569;">
            You can access your medical consultation room or follow-up call using the link below:
          </p>
          <a href="${consultationLink}" target="_blank" class="btn">Join Video Consultation</a>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; word-break: break-all;">
            Direct link: ${consultationLink}
          </p>
        </div>
        ` : ''}

        <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
          If you have any questions or your symptoms persist, please reach out to your designated care coordinator or visit your nearest medical clinic.
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px 0;"><strong>MediLanka Embassy Aid Connect</strong></p>
        <p style="margin: 0 0 10px 0;">Specialized Medical Support for Visitors, Diplomats & Travelers</p>
        <div class="emergency-box">
          🚨 Emergency Notice: If you experience acute severe symptoms, shortness of breath, or chest pain, call <strong>1990</strong> (Ambulance) immediately.
        </div>
        <p style="margin-top: 14px; font-size: 11px; color: #94a3b8;">
          CONFIDENTIALITY NOTICE: This transmission is intended only for the use of the individual named above and contains confidential medical information.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Sends consultation summary and prescription email to the patient
 */
export async function sendConsultationSummaryEmail(
  data: ConsultationEmailData
): Promise<SendEmailResult> {
  const { patientEmail, patientName, trackingCode } = data;

  if (!patientEmail || !patientEmail.includes('@')) {
    console.warn(`[EmailService] Invalid patient email provided: "${patientEmail}"`);
    return { success: false, error: 'Invalid patient email address' };
  }

  const resend = getResendClient();
  if (!resend) {
    console.warn(
      '[EmailService] RESEND_API_KEY is not set or is empty in server/.env. Email sending skipped.'
    );
    return {
      success: false,
      skipped: true,
      error: 'RESEND_API_KEY is not configured in server/.env',
    };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'MediLanka Care <onboarding@resend.dev>';
    const subject = trackingCode
      ? `Medical Consultation Summary & Prescription [Track: #${trackingCode}]`
      : `Medical Consultation Summary & Prescription - MediLanka`;

    const html = buildConsultationEmailHtml(data);

    console.log(`[EmailService] Sending consultation summary email to ${patientEmail}...`);

    const result = await resend.emails.send({
      from: fromEmail,
      to: [patientEmail],
      subject,
      html,
    });

    if (result.error) {
      console.error('[EmailService] Resend API returned error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Resend API returned an error',
      };
    }

    console.log(`[EmailService] Email sent successfully! Message ID: ${result.data?.id}`);
    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (err: any) {
    console.error('[EmailService] Exception sending email via Resend:', err);
    return {
      success: false,
      error: err.message || 'Unknown email sending error',
    };
  }
}

/**
 * Sends meeting link notification email to the patient
 */
export async function sendConsultationLinkEmail(
  data: ConsultationEmailData
): Promise<SendEmailResult> {
  const { patientEmail, patientName, trackingCode, consultationLink } = data;

  if (!patientEmail || !patientEmail.includes('@')) {
    return { success: false, error: 'Invalid patient email address' };
  }

  const resend = getResendClient();
  if (!resend) {
    console.warn('[EmailService] RESEND_API_KEY is not configured in server/.env.');
    return {
      success: false,
      skipped: true,
      error: 'RESEND_API_KEY is not configured in server/.env',
    };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'MediLanka Care <onboarding@resend.dev>';
    const subject = `Your Consultation Link is Ready - MediLanka #${trackingCode || ''}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f6f8; padding: 20px; }
    .box { max-width: 580px; margin: 0 auto; background: #fff; border-radius: 10px; padding: 30px; border: 1px solid #e2e8f0; }
    .btn { display: inline-block; background: #0284c7; color: #fff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="box">
    <h2 style="color: #0284c7; margin-top: 0;">Your Medical Consultation Link</h2>
    <p>Dear <strong>${patientName || 'Patient'}</strong>,</p>
    <p>Your doctor has prepared the live consultation room for your medical appointment.</p>
    <p>Please click the button below to join the consultation:</p>
    <div style="text-align: center;">
      <a href="${consultationLink}" target="_blank" class="btn">Join Consultation Now</a>
    </div>
    <p style="font-size: 12px; color: #64748b;">Direct URL: <a href="${consultationLink}">${consultationLink}</a></p>
    <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Tracking Reference: <strong>#${trackingCode || 'N/A'}</strong></p>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: fromEmail,
      to: [patientEmail],
      subject,
      html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
