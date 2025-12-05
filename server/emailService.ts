import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
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
  const { client, fromEmail } = await getUncachableResendClient();
  
  const emailPayload: any = {
    from: fromEmail,
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
  
  const result = await client.emails.send(emailPayload);

  return result;
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
