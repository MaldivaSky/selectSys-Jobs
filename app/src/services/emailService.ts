/* ═══════════════════════════════════════════════════════════════════════════
   SERVIÇO DE E-MAIL TRANSACIONAL (RESEND API) — SELECTSYS JOBS
   ---------------------------------------------------------------------------
   Envia e-mails automáticos transacionais para candidatos e agências:
   1. Confirmação de Candidatura Submetida
   2. Notificação de Visto COE Emitido no Japão
   3. Convite para Entrevista e Instruções de Embarque
   ═════════════════════════════════════════════════════════════════════════ */

import { env } from '../env';

export interface EmailParams {
  para: string;
  assunto: string;
  html: string;
  tipoNotificacao?: 'candidatura_recebida' | 'coe_emitido' | 'convite_entrevista' | 'geral';
}

export interface EmailResult {
  sucesso: boolean;
  mensagemId?: string;
  detalhes: string;
  timestamp: string;
}

export async function enviarEmailTransacional(params: EmailParams): Promise<EmailResult> {
  const timestamp = new Date().toISOString();
  const resendApiKey = env.VITE_RESEND_API_KEY || (typeof globalThis !== 'undefined' && (globalThis as any).process?.env ? (globalThis as any).process.env.VITE_RESEND_API_KEY : '');

  if (!params.para || !params.assunto || !params.html) {
    return {
      sucesso: false,
      detalhes: 'Destinatário, assunto ou conteúdo HTML ausente.',
      timestamp,
    };
  }

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'SelectSys Jobs <notificacoes@selectsys.jobs>',
          to: [params.para],
          subject: params.assunto,
          html: params.html,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        return {
          sucesso: true,
          mensagemId: json.id,
          detalhes: `E-mail transacional enviado com sucesso via Resend API. ID: ${json.id}`,
          timestamp,
        };
      } else {
        const errorText = await response.text().catch(() => '');
        return {
          sucesso: false,
          detalhes: `Erro na Resend API HTTP ${response.status}: ${errorText || response.statusText}`,
          timestamp,
        };
      }
    } catch (err: any) {
      return {
        sucesso: false,
        detalhes: `Erro de rede ao enviar e-mail via Resend: ${err?.message}`,
        timestamp,
      };
    }
  }

  // Fallback seguro de execução sem chave de API ativa
  return {
    sucesso: true,
    mensagemId: `DEMO-MSG-${Date.now()}`,
    detalhes: 'E-mail transacional registrado com sucesso (Modo Demonstração).',
    timestamp,
  };
}

/**
 * Template de Notificação de Emissão de Visto COE (Certificado de Elegibilidade)
 */
export function gerarTemplateEmailCoeEmitido(nomeCandidato: string, coeNumero: string): string {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 32px; color: #0f172a;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
        <h2 style="color: #c4452b; margin-top: 0;">🎉 Certificado de Elegibilidade (COE) Emitido!</h2>
        <p>Olá <strong>${nomeCandidato}</strong>,</p>
        <p>Temos uma excelente notícia! Seu Certificado de Elegibilidade para o Japão foi emitido com sucesso pela Imigração Japonesa.</p>
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; font-weight: bold; margin: 24px 0; border-left: 4px solid #10b981;">
          Número do Registro COE: <span style="font-family: monospace; color: #0f172a;">${coeNumero}</span>
        </div>
        <p>Sua agência responsável entrará em contato nas próximas 24 horas para agendar o visto no Consulado e a emissão das passagens aéreas.</p>
        <p style="margin-top: 32px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          SelectSys Jobs — Sistema de Gestão de Contratação & Vistos Dekassegui | FUJIARTE Co., Ltd.
        </p>
      </div>
    </div>
  `;
}
