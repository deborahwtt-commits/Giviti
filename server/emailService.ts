import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  console.log('[EmailService] Getting Resend credentials...');
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  console.log('[EmailService] Connectors hostname:', hostname ? 'configured' : 'NOT CONFIGURED');
  
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    console.error('[EmailService] ERROR: X_REPLIT_TOKEN not found - REPL_IDENTITY and WEB_REPL_RENEWAL are both undefined');
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }
  
  console.log('[EmailService] Token type:', xReplitToken.startsWith('repl') ? 'REPL' : 'DEPL');

  try {
    const url = 'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend';
    console.log('[EmailService] Fetching credentials from connectors API...');
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    });
    
    console.log('[EmailService] API response status:', response.status);
    
    const data = await response.json();
    connectionSettings = data.items?.[0];
    
    if (!connectionSettings) {
      console.error('[EmailService] ERROR: No Resend connection found in response. Make sure Resend integration is connected.');
      console.error('[EmailService] Response data:', JSON.stringify(data, null, 2));
      throw new Error('Resend not connected - no connection found');
    }
    
    if (!connectionSettings.settings?.api_key) {
      console.error('[EmailService] ERROR: Resend connection exists but API key is missing');
      throw new Error('Resend not connected - missing API key');
    }
    
    console.log('[EmailService] Credentials obtained successfully');
    console.log('[EmailService] From email:', connectionSettings.settings.from_email);
    
    return {
      apiKey: connectionSettings.settings.api_key, 
      fromEmail: connectionSettings.settings.from_email
    };
  } catch (error) {
    console.error('[EmailService] Failed to get credentials:', error);
    throw error;
  }
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  console.log('[EmailService] Preparing to send email...');
  console.log('[EmailService] To:', options.to);
  console.log('[EmailService] Subject:', options.subject);
  
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    // Check if fromEmail domain is likely unverified (gmail, outlook, etc.)
    // Use Resend's test email for unverified domains
    const unverifiedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];
    const emailDomain = fromEmail?.split('@')[1]?.toLowerCase();
    const isUnverifiedDomain = emailDomain && unverifiedDomains.includes(emailDomain);
    
    // Use test email for unverified domains, otherwise use configured email
    const effectiveFromEmail = isUnverifiedDomain 
      ? 'Giviti <onboarding@resend.dev>'
      : fromEmail;
    
    if (isUnverifiedDomain) {
      console.log('[EmailService] Using Resend test email (domain not verified):', effectiveFromEmail);
    }
    
    const emailPayload: any = {
      from: effectiveFromEmail,
      to: options.to,
      subject: options.subject,
    };
    
    if (options.html) {
      emailPayload.html = options.html;
    }
    
    if (options.text) {
      emailPayload.text = options.text;
    }
    
    if (options.replyTo) {
      emailPayload.replyTo = options.replyTo;
    }
    
    console.log('[EmailService] Sending email via Resend...');
    const result = await client.emails.send(emailPayload);
    
    if (result.error) {
      console.error('[EmailService] Resend API error:', result.error);
      throw new Error(`Resend error: ${result.error.message}`);
    }
    
    console.log('[EmailService] Email sent successfully! ID:', result.data?.id);
    return result;
  } catch (error) {
    console.error('[EmailService] Failed to send email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(to: string, userName: string) {
  return sendEmail({
    to,
    subject: 'Bem-vindo ao Giviti!',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e11d48; margin-bottom: 20px;">Bem-vindo ao Giviti!</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Olá ${userName},
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Estamos muito felizes em ter você conosco! O Giviti vai te ajudar a nunca mais esquecer 
          datas importantes e sempre encontrar o presente perfeito para as pessoas que você ama.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Comece cadastrando seus presenteados e eventos especiais!
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Equipe Giviti
        </p>
      </div>
    `
  });
}

export async function sendEventReminderEmail(
  to: string, 
  userName: string, 
  eventName: string, 
  eventDate: string,
  recipientName: string
) {
  return sendEmail({
    to,
    subject: `Lembrete: ${eventName} está chegando!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e11d48; margin-bottom: 20px;">Não esqueça!</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Olá ${userName},
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          O evento <strong>${eventName}</strong> de <strong>${recipientName}</strong> está chegando!
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          <strong>Data:</strong> ${eventDate}
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Já escolheu o presente? Acesse o Giviti para ver sugestões personalizadas!
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Equipe Giviti
        </p>
      </div>
    `
  });
}

export async function sendCollaborativeEventInviteEmail(
  to: string,
  inviterName: string,
  eventName: string,
  eventType: string,
  inviteLink: string
) {
  const eventTypeLabels: Record<string, string> = {
    secret_santa: 'Amigo Secreto',
    themed_night: 'Noite Temática',
    collective_gift: 'Presente Coletivo'
  };
  
  const typeLabel = eventTypeLabels[eventType] || 'Rolê';
  
  return sendEmail({
    to,
    subject: `${inviterName} te convidou para um ${typeLabel}!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e11d48; margin-bottom: 20px;">Você foi convidado!</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          <strong>${inviterName}</strong> te convidou para participar do ${typeLabel}: 
          <strong>${eventName}</strong>
        </p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${inviteLink}" 
             style="background-color: #e11d48; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; font-weight: 600;">
            Aceitar Convite
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Se você não esperava este convite, pode ignorar este email.
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Equipe Giviti
        </p>
      </div>
    `
  });
}
