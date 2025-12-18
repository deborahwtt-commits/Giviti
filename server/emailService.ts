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
    
    // Normalize recipient email(s) to lowercase (Resend is case-sensitive for test accounts)
    const normalizedTo = Array.isArray(options.to) 
      ? options.to.map(email => email.toLowerCase().trim())
      : options.to.toLowerCase().trim();
    
    console.log('[EmailService] Normalized To:', normalizedTo);
    
    // Use verified domain email for sending
    // giviti.com.br is verified in Resend
    const verifiedFromEmail = 'Giviti <contato@giviti.com.br>';
    
    console.log('[EmailService] Using verified domain email:', verifiedFromEmail);
    
    const emailPayload: any = {
      from: verifiedFromEmail,
      to: normalizedTo,
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
  inviteLink: string,
  confirmationDeadline?: string | Date | null
) {
  const eventTypeLabels: Record<string, string> = {
    secret_santa: 'Amigo Secreto',
    themed_night: 'Noite Temática',
    collective_gift: 'Presente Coletivo'
  };
  
  const typeLabel = eventTypeLabels[eventType] || 'Rolê';
  
  const formatDeadline = (deadline: string | Date | null | undefined) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  const formattedDeadline = formatDeadline(confirmationDeadline);
  
  const deadlineHtml = formattedDeadline ? `
              <p style="color: #dc2626; font-weight: 600; margin: 0 0 16px 0; font-size: 14px; text-align: center; font-family: Arial, sans-serif;">
                Confirme sua presença até: ${formattedDeadline}
              </p>
  ` : '';

  return sendEmail({
    to,
    subject: `${inviterName} te convidou para um ${typeLabel}!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; max-width: 600px;">
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="color: #e11d48; margin: 0 0 24px 0; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;">
                Você foi convidado!
              </h1>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; font-family: Arial, sans-serif;">
                <strong>${inviterName}</strong> te convidou para participar do ${typeLabel}:
              </p>
              <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 24px 0; font-family: Arial, sans-serif;">
                <strong>${eventName}</strong>
              </p>
              ${deadlineHtml}
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${inviteLink}" style="display: inline-block; background-color: #e11d48; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-family: Arial, sans-serif; font-size: 16px;">
                      Aceitar Convite
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0; font-family: Arial, sans-serif;">
                Se você não esperava este convite, pode ignorar este email.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0; font-family: Arial, sans-serif;">
                Equipe Giviti
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  });
}

export interface ReceiverProfile {
  zodiacSign?: string | null;
  giftPreference?: string | null;
  freeTimeActivity?: string | null;
  musicalStyle?: string | null;
  specialTalent?: string | null;
  giftsToAvoid?: string | null;
  interests?: string[] | null;
}

export interface SecretSantaDrawEmailOptions {
  to: string;
  participantName: string;
  receiverName: string;
  eventName: string;
  eventDate?: string | null;
  eventLocation?: string | null;
  eventDescription?: string | null;
  rules?: {
    minGiftValue?: number | null;
    maxGiftValue?: number | null;
    rulesDescription?: string | null;
  } | null;
  signupLink: string;
  receiverProfile?: ReceiverProfile | null;
}

export async function sendSecretSantaDrawResultEmail(options: SecretSantaDrawEmailOptions) {
  const {
    to,
    participantName,
    receiverName,
    eventName,
    eventDate,
    eventLocation,
    eventDescription,
    rules,
    signupLink,
    receiverProfile
  } = options;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDate(eventDate);

  const hasRules = rules && (rules.minGiftValue || rules.maxGiftValue || rules.rulesDescription);

  let rulesHtml = '';
  if (hasRules) {
    rulesHtml = `
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">Regras do Amigo Secreto</h3>
        ${rules.minGiftValue || rules.maxGiftValue ? `
          <p style="color: #78350f; margin: 8px 0; font-size: 14px;">
            <strong>Valor do presente:</strong> 
            ${rules.minGiftValue ? `mínimo R$ ${rules.minGiftValue.toFixed(2)}` : ''}
            ${rules.minGiftValue && rules.maxGiftValue ? ' - ' : ''}
            ${rules.maxGiftValue ? `máximo R$ ${rules.maxGiftValue.toFixed(2)}` : ''}
          </p>
        ` : ''}
        ${rules.rulesDescription ? `
          <p style="color: #78350f; margin: 8px 0; font-size: 14px;">
            <strong>Observações:</strong> ${rules.rulesDescription}
          </p>
        ` : ''}
      </div>
    `;
  }

  const getZodiacEmoji = (sign: string | null | undefined): string => {
    if (!sign) return '';
    const signs: Record<string, string> = {
      "Áries": "♈", "Aries": "♈",
      "Touro": "♉", "Taurus": "♉",
      "Gêmeos": "♊", "Gemini": "♊",
      "Câncer": "♋", "Cancer": "♋",
      "Leão": "♌", "Leo": "♌",
      "Virgem": "♍", "Virgo": "♍",
      "Libra": "♎",
      "Escorpião": "♏", "Scorpio": "♏",
      "Sagitário": "♐", "Sagittarius": "♐",
      "Capricórnio": "♑", "Capricorn": "♑",
      "Aquário": "♒", "Aquarius": "♒",
      "Peixes": "♓", "Pisces": "♓",
    };
    return signs[sign] || '';
  };

  let profileHtml = '';
  const hasProfile = receiverProfile && (
    receiverProfile.zodiacSign ||
    receiverProfile.giftPreference ||
    receiverProfile.freeTimeActivity ||
    receiverProfile.musicalStyle ||
    receiverProfile.specialTalent ||
    receiverProfile.giftsToAvoid ||
    (receiverProfile.interests && receiverProfile.interests.length > 0)
  );

  if (hasProfile && receiverProfile) {
    const firstName = receiverName.split(' ')[0];
    
    let profileItems = '';
    
    if (receiverProfile.zodiacSign) {
      profileItems += `
        <tr>
          <td style="padding: 8px 12px; vertical-align: top; width: 50%;">
            <span style="font-size: 20px;">${getZodiacEmoji(receiverProfile.zodiacSign)}</span>
            <span style="color: #6b7280; font-size: 12px; display: block;">Signo</span>
            <span style="color: #374151; font-weight: 500;">${receiverProfile.zodiacSign}</span>
          </td>
        </tr>
      `;
    }
    
    if (receiverProfile.freeTimeActivity) {
      profileItems += `
        <tr>
          <td style="padding: 8px 12px; vertical-align: top;">
            <span style="color: #f59e0b; font-size: 16px;">✨</span>
            <span style="color: #6b7280; font-size: 12px; display: block;">Tempo livre</span>
            <span style="color: #374151; font-weight: 500;">${receiverProfile.freeTimeActivity}</span>
          </td>
        </tr>
      `;
    }
    
    if (receiverProfile.musicalStyle) {
      profileItems += `
        <tr>
          <td style="padding: 8px 12px; vertical-align: top;">
            <span style="color: #8b5cf6; font-size: 16px;">🎵</span>
            <span style="color: #6b7280; font-size: 12px; display: block;">Estilo musical</span>
            <span style="color: #374151; font-weight: 500;">${receiverProfile.musicalStyle}</span>
          </td>
        </tr>
      `;
    }
    
    if (receiverProfile.specialTalent) {
      profileItems += `
        <tr>
          <td style="padding: 8px 12px; vertical-align: top;">
            <span style="color: #eab308; font-size: 16px;">⭐</span>
            <span style="color: #6b7280; font-size: 12px; display: block;">Talento especial</span>
            <span style="color: #374151; font-weight: 500;">${receiverProfile.specialTalent}</span>
          </td>
        </tr>
      `;
    }
    
    let interestsHtml = '';
    if (receiverProfile.interests && receiverProfile.interests.length > 0) {
      const badges = receiverProfile.interests.map(interest => 
        `<span style="display: inline-block; background-color: #e5e7eb; color: #374151; padding: 4px 10px; border-radius: 12px; font-size: 12px; margin: 2px;">${interest}</span>`
      ).join(' ');
      interestsHtml = `
        <div style="margin-top: 12px; padding: 12px;">
          <span style="color: #6b7280; font-size: 12px; display: block; margin-bottom: 8px;">Interesses</span>
          ${badges}
        </div>
      `;
    }
    
    let giftPreferenceHtml = '';
    if (receiverProfile.giftPreference) {
      giftPreferenceHtml = `
        <div style="background-color: #fdf2f8; padding: 12px; border-radius: 8px; margin-top: 12px;">
          <span style="color: #6b7280; font-size: 12px; display: block;">Preferência de presente</span>
          <span style="color: #374151; font-weight: 500;">${receiverProfile.giftPreference}</span>
        </div>
      `;
    }
    
    let giftsToAvoidHtml = '';
    if (receiverProfile.giftsToAvoid) {
      giftsToAvoidHtml = `
        <div style="background-color: #fef2f2; padding: 12px; border-radius: 8px; margin-top: 12px;">
          <span style="color: #dc2626; font-size: 12px; display: block;">Evitar</span>
          <span style="color: #6b7280;">${receiverProfile.giftsToAvoid}</span>
        </div>
      `;
    }
    
    profileHtml = `
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; margin: 24px 0;">
        <h3 style="color: #e11d48; margin: 0 0 4px 0; font-size: 18px; display: flex; align-items: center;">
          <span style="color: #ec4899; margin-right: 8px;">💝</span> Sobre ${firstName}
        </h3>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 16px 0;">
          Conheça um pouco mais para escolher o presente perfeito
        </p>
        
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          ${profileItems}
        </table>
        
        ${interestsHtml}
        ${giftPreferenceHtml}
        ${giftsToAvoidHtml}
      </div>
    `;
  }

  return sendEmail({
    to,
    subject: `O sorteio do Amigo Secreto "${eventName}" foi realizado!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e11d48; margin-bottom: 10px;">O sorteio foi realizado!</h1>
          <p style="color: #6b7280; font-size: 14px;">Amigo Secreto: ${eventName}</p>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Olá <strong>${participantName}</strong>!
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Temos uma notícia quentinha pra você! O sorteio do Amigo Secreto foi realizado e...
        </p>

        <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.9;">Você tirou:</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold;">${receiverName}</p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 16px;">Detalhes do Evento</h3>
          
          ${formattedDate ? `
            <p style="color: #6b7280; margin: 8px 0; font-size: 14px;">
              <strong>Quando:</strong> ${formattedDate}
            </p>
          ` : ''}
          
          ${eventLocation ? `
            <p style="color: #6b7280; margin: 8px 0; font-size: 14px;">
              <strong>Onde:</strong> ${eventLocation}
            </p>
          ` : ''}
          
          ${eventDescription ? `
            <p style="color: #6b7280; margin: 8px 0; font-size: 14px;">
              <strong>Sobre:</strong> ${eventDescription}
            </p>
          ` : ''}
        </div>

        ${rulesHtml}

        ${profileHtml}

        <div style="background-color: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center;">
          <p style="color: #065f46; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">
            Quer facilitar a vida de quem te tirou?
          </p>
          <p style="color: #047857; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5;">
            Cadastre-se no Giviti e preencha suas preferências! Assim, seu amigo secreto 
            não vai precisar adivinhar se você prefere meias ou um drone. 
            (Spoiler: ninguém quer meias. Ou quer? Conte pra gente!)
          </p>
          <a href="${signupLink}" 
             style="display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Criar Conta e Preencher Preferências
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          Este email foi enviado automaticamente pelo Giviti. 
          Psiu... não conta pra ninguém quem você tirou!
        </p>
      </div>
    `
  });
}

export interface ThemedNightInviteEmailOptions {
  to: string;
  inviterName: string;
  eventName: string;
  categoryName?: string | null;
  categoryDescription?: string | null;
  eventDate?: string | null;
  eventLocation?: string | null;
  eventDescription?: string | null;
  categorySuggestions?: string[] | null;
  signupLink: string;
  confirmationDeadline?: string | Date | null;
}

export async function sendThemedNightInviteEmail(options: ThemedNightInviteEmailOptions) {
  const {
    to,
    inviterName,
    eventName,
    categoryName,
    categoryDescription,
    eventDate,
    eventLocation,
    eventDescription,
    categorySuggestions,
    signupLink,
    confirmationDeadline
  } = options;

  const formatDeadline = (deadline: string | Date | null | undefined) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formattedDeadline = formatDeadline(confirmationDeadline);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDate(eventDate);

  let suggestionsHtml = '';
  if (categorySuggestions && categorySuggestions.length > 0) {
    const suggestionsList = categorySuggestions.slice(0, 5).map(s => 
      `<li style="color: #6b21a8; margin: 6px 0; font-size: 14px;">${s}</li>`
    ).join('');
    
    suggestionsHtml = `
      <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 1px solid #d8b4fe; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h3 style="color: #7c3aed; margin: 0 0 12px 0; font-size: 16px;">
          Que tal escolher um dos itens abaixo pra arrasar no rolê?
        </h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${suggestionsList}
        </ul>
      </div>
    `;
  }

  const categoryBadge = categoryName 
    ? `<span style="display: inline-block; background-color: #a855f7; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 8px;">${categoryName}</span>`
    : '';

  return sendEmail({
    to,
    subject: `${inviterName} te convidou para uma Noite Temática!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%); padding: 30px 20px; border-radius: 16px; margin-bottom: 20px;">
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 8px 0;">Você foi convidado(a) para</p>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Noite Temática</h1>
          </div>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
          <strong>${inviterName}</strong> te convidou para participar de um rolê especial!
        </p>

        <div style="background-color: #faf5ff; border: 2px solid #c4b5fd; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #7c3aed;">O tema é:</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #5b21b6;">
            ${eventName}${categoryBadge}
          </p>
          ${categoryDescription ? `
            <p style="margin: 12px 0 0 0; font-size: 16px; color: #6b21a8; font-style: italic;">
              "${categoryDescription}"
            </p>
          ` : ''}
          ${eventDescription ? `
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #7c3aed;">
              ${eventDescription}
            </p>
          ` : ''}
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 16px;">Detalhes do Evento</h3>
          
          ${formattedDate ? `
            <p style="color: #6b7280; margin: 8px 0; font-size: 14px;">
              <strong>Quando:</strong> ${formattedDate}
            </p>
          ` : ''}
          
          ${eventLocation ? `
            <p style="color: #6b7280; margin: 8px 0; font-size: 14px;">
              <strong>Onde:</strong> ${eventLocation}
            </p>
          ` : ''}

          ${!formattedDate && !eventLocation ? `
            <p style="color: #9ca3af; margin: 0; font-size: 14px; font-style: italic;">
              Mais detalhes em breve...
            </p>
          ` : ''}
        </div>

        ${suggestionsHtml}

        ${formattedDeadline ? `
          <p style="color: #dc2626; font-weight: 600; margin: 16px 0; text-align: center;">
            Confirme sua presença até: ${formattedDeadline}
          </p>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${signupLink}" 
             style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; padding: 16px 32px; 
                    text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
            Confirmar Presença
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 20px 0;">
          Ao clicar acima, você será direcionado para criar sua conta ou fazer login no Giviti.
        </p>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>Dica:</strong> Ao criar sua conta, você pode preencher suas preferências 
            e facilitar a vida de quem quiser te dar presentes no futuro!
          </p>
        </div>

        <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px;">
          Se você não esperava este convite, pode ignorar este email.
        </p>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          Este email foi enviado automaticamente pelo Giviti. 
          Preparado(a) para o rolê?
        </p>
      </div>
    `
  });
}

export interface CollectiveGiftInviteEmailOptions {
  to: string;
  inviterName: string;
  eventName: string;
  recipientName?: string | null;
  giftName?: string | null;
  giftDescription?: string | null;
  targetAmount?: number | null;
  amountPerPerson?: number | null;
  eventDate?: string | null;
  eventDescription?: string | null;
  purchaseLink?: string | null;
  signupLink: string;
  confirmationDeadline?: string | Date | null;
}

export async function sendCollectiveGiftInviteEmail(options: CollectiveGiftInviteEmailOptions) {
  const {
    to,
    inviterName,
    eventName,
    recipientName,
    giftName,
    giftDescription,
    targetAmount,
    amountPerPerson,
    eventDate,
    eventDescription,
    purchaseLink,
    signupLink,
    confirmationDeadline
  } = options;

  const formatDeadline = (deadline: string | Date | null | undefined) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formattedDeadline = formatDeadline(confirmationDeadline);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDate(eventDate);
  const formattedTarget = targetAmount ? (targetAmount / 100).toFixed(2) : null;
  const formattedPerPerson = amountPerPerson ? (amountPerPerson / 100).toFixed(2) : null;

  let giftDetailsHtml = '';
  if (giftName || giftDescription) {
    giftDetailsHtml = `
      <div style="background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border: 1px solid #fbcfe8; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h3 style="color: #be185d; margin: 0 0 12px 0; font-size: 16px;">
          Sobre o Presente
        </h3>
        ${giftName ? `<p style="color: #9d174d; margin: 8px 0; font-size: 18px; font-weight: bold;">${giftName}</p>` : ''}
        ${giftDescription ? `<p style="color: #be185d; margin: 8px 0; font-size: 14px;">${giftDescription}</p>` : ''}
        ${purchaseLink ? `
          <p style="margin: 16px 0 0 0;">
            <a href="${purchaseLink}" style="color: #be185d; font-size: 14px; text-decoration: underline;">
              Ver produto na loja
            </a>
          </p>
        ` : ''}
      </div>
    `;
  }

  let contributionHtml = '';
  if (formattedPerPerson || formattedTarget) {
    contributionHtml = `
      <div style="background-color: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
        <p style="color: #065f46; font-size: 14px; margin: 0 0 8px 0;">Sua contribuição sugerida:</p>
        ${formattedPerPerson ? `
          <p style="color: #047857; font-size: 28px; font-weight: bold; margin: 0;">
            R$ ${formattedPerPerson}
          </p>
        ` : ''}
        ${formattedTarget ? `
          <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0 0;">
            Valor total do presente: R$ ${formattedTarget}
          </p>
        ` : ''}
      </div>
    `;
  }

  return sendEmail({
    to,
    subject: `${inviterName} te convidou para um Presente Coletivo${recipientName ? ` para ${recipientName}` : ''}!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%); padding: 30px 20px; border-radius: 16px; margin-bottom: 20px;">
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 8px 0;">Você foi convidado(a) para</p>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Presente Coletivo</h1>
          </div>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
          <strong>${inviterName}</strong> te convidou para participar de um presente especial!
        </p>

        <div style="background-color: #fdf2f8; border: 2px solid #f9a8d4; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #be185d;">${eventName}</p>
          ${recipientName ? `
            <p style="margin: 0; font-size: 14px; color: #9d174d;">
              Presente para: <span style="font-size: 20px; font-weight: bold; display: block; margin-top: 4px;">${recipientName}</span>
            </p>
          ` : ''}
          ${eventDescription ? `
            <p style="margin: 12px 0 0 0; font-size: 14px; color: #be185d;">
              ${eventDescription}
            </p>
          ` : ''}
        </div>

        ${giftDetailsHtml}

        ${contributionHtml}

        ${formattedDate ? `
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              <strong>Data limite para contribuição:</strong> ${formattedDate}
            </p>
          </div>
        ` : ''}

        ${formattedDeadline ? `
          <p style="color: #dc2626; font-weight: 600; margin: 16px 0; text-align: center;">
            Confirme sua presença até: ${formattedDeadline}
          </p>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${signupLink}" 
             style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); color: white; padding: 16px 32px; 
                    text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4);">
            Participar do Presente
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 20px 0;">
          Ao clicar acima, você será direcionado para criar sua conta ou fazer login no Giviti.
        </p>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>Como funciona:</strong> O organizador do presente irá acompanhar as contribuições e, 
            quando o valor for atingido, fará a compra do presente. Você pode contribuir com qualquer valor!
          </p>
        </div>

        <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px;">
          Se você não esperava este convite, pode ignorar este email.
        </p>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          Este email foi enviado automaticamente pelo Giviti. 
          Juntos, presenteamos melhor!
        </p>
      </div>
    `
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string, userName?: string) {
  return sendEmail({
    to,
    subject: 'Redefinir sua senha - Giviti',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e11d48; margin-bottom: 10px;">Redefinir Senha</h1>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Olá${userName ? ` ${userName}` : ''},
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Recebemos uma solicitação para redefinir a senha da sua conta no Giviti.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="display: inline-block; background-color: #e11d48; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Redefinir Minha Senha
          </a>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>Importante:</strong> Este link expira em 1 hora. Se você não solicitou esta redefinição, 
            pode ignorar este email com segurança.
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
        </p>
        <p style="color: #6b7280; font-size: 12px; word-break: break-all;">
          ${resetLink}
        </p>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          Este email foi enviado automaticamente pelo Giviti.
        </p>
      </div>
    `
  });
}

export interface BirthdayInviteEmailOptions {
  to: string;
  guestName: string;
  ownerName: string;
  eventName: string;
  eventDate?: string | null;
  eventLocation?: string | null;
  wishlistLink: string;
}

export async function sendBirthdayInviteEmail(options: BirthdayInviteEmailOptions) {
  const {
    to,
    guestName,
    ownerName,
    eventName,
    eventDate,
    eventLocation,
    wishlistLink
  } = options;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDate(eventDate);

  // Get base URL for signup link - use custom domain in production
  const baseUrl = process.env.REPLIT_DEPLOYMENT === "1"
    ? "https://giviti.com.br"
    : process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "http://localhost:5000";
  const signupLink = baseUrl;

  return sendEmail({
    to,
    subject: `${ownerName} te convidou para o aniversário!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb;">
          <tr>
            <td align="center" style="padding: 20px;">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; font-family: Inter, Arial, sans-serif;">
                <tr>
                  <td style="padding: 20px;">
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align: center; margin-bottom: 30px;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fb7185 100%); padding: 30px 20px; border-radius: 16px;">
                          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 8px 0;">Você está convidado(a)!</p>
                          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">${eventName}</h1>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                      Olá <strong>${guestName}</strong>!
                    </p>

                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                      <strong>${ownerName}</strong> te convidou para comemorar seu aniversário!
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0;">
                      <tr>
                        <td style="background-color: #fdf2f8; padding: 16px; border-radius: 8px; text-align: center;">
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                            Fiz uma wishlist com presentes pagos e outros que custam um total de 0 reais mas valem muito! Porque presentear com estilo não precisa vir com boleto depois.
                          </p>
                        </td>
                      </tr>
                    </table>

                    ${formattedDate || eventLocation ? `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                      <tr>
                        <td style="background-color: #fdf2f8; border: 1px solid #fbcfe8; padding: 20px; border-radius: 12px;">
                          <h3 style="color: #be185d; margin: 0 0 12px 0; font-size: 16px;">Detalhes do Evento</h3>
                          ${formattedDate ? `
                          <p style="color: #9d174d; margin: 8px 0; font-size: 14px; line-height: 1.5;">
                            <strong>Quando:</strong> ${formattedDate}
                          </p>
                          ` : ''}
                          ${eventLocation ? `
                          <p style="color: #9d174d; margin: 8px 0; font-size: 14px; line-height: 1.5;">
                            <strong>Onde:</strong> ${eventLocation}
                          </p>
                          ` : ''}
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${wishlistLink}" 
                             style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); color: white; padding: 16px 32px; 
                                    text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                            Clique para aceitar ou recusar
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 20px 0;">
                      Se você não conhece ${ownerName}, pode ignorar este email.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                      <tr>
                        <td style="background-color: #ecfdf5; border: 2px dashed #10b981; padding: 24px; border-radius: 12px; text-align: center;">
                          <p style="color: #065f46; font-size: 18px; margin: 0 0 12px 0; font-weight: 600;">
                            Quer facilitar sua vida nas próximas festas?
                          </p>
                          <p style="color: #047857; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6;">
                            Crie sua conta grátis no Giviti e nunca mais esqueça um aniversário importante! 
                            Além de organizar seus próprios eventos, você pode criar listas de desejos, 
                            receber lembretes e descobrir o presente perfeito para cada pessoa especial na sua vida. 
                            É rápido, é grátis, e seu futuro eu agradece!
                          </p>
                          <a href="${signupLink}" 
                             style="display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; 
                                    text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Criar minha conta Giviti grátis
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      Este email foi enviado automaticamente pelo Giviti.
                    </p>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });
}

export interface EventCancellationEmailOptions {
  to: string;
  participantName: string;
  eventName: string;
  eventType: string;
  organizerName: string;
  eventDate?: string | null;
}

export async function sendEventCancellationEmail(options: EventCancellationEmailOptions) {
  const {
    to,
    participantName,
    eventName,
    eventType,
    organizerName,
    eventDate
  } = options;

  const eventTypeLabels: Record<string, string> = {
    secret_santa: 'Amigo Secreto',
    themed_night: 'Noite Temática',
    collective_gift: 'Presente Coletivo'
  };
  
  const typeLabel = eventTypeLabels[eventType] || 'Evento';

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDate(eventDate);
  const dateHtml = formattedDate ? `
    <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0; font-family: Arial, sans-serif;">
      <strong>Data prevista:</strong> ${formattedDate}
    </p>
  ` : '';

  return sendEmail({
    to,
    subject: `${typeLabel} "${eventName}" foi cancelado`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; max-width: 600px;">
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="color: #dc2626; margin: 0 0 24px 0; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;">
                Evento Cancelado
              </h1>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; font-family: Arial, sans-serif;">
                Olá ${participantName},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; font-family: Arial, sans-serif;">
                Infelizmente, o ${typeLabel} <strong>"${eventName}"</strong> organizado por <strong>${organizerName}</strong> foi cancelado.
              </p>
              ${dateHtml}
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-family: Arial, sans-serif;">
                Se você tiver dúvidas, entre em contato com o organizador.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0; font-family: Arial, sans-serif;">
                Equipe Giviti
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  });
}
