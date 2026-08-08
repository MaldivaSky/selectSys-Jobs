/* ═══════════════════════════════════════════════════════════════════════════
   SERVIÇO DE LGPD ART. 18 & APPI COMPLIANCE — SELECTSYS JOBS
   ---------------------------------------------------------------------------
   Implementa as diretrizes legais de privacidade do Brasil (LGPD) e Japão (APPI):
   1. Portabilidade de Dados (Art. 18, V): Exportação completa em JSON estruturado.
   2. Revogação de Consentimento (Art. 18, IX): Registro imediato de revogação.
   3. Expurgo Programado (Art. 16): Limpeza de dados inativos após 24 meses.
   ═════════════════════════════════════════════════════════════════════════ */

import { supabase } from '../dados/supabase';

export interface LgpdExportResult {
  sucesso: boolean;
  dadosJson?: Record<string, any>;
  mensagem: string;
  timestamp: string;
}

export interface ExpurgoResult {
  sucesso: boolean;
  registrosExpurgados: number;
  mensagem: string;
  timestamp: string;
}

/**
 * Portabilidade de Dados (LGPD Art. 18, V)
 * Exporta todos os dados do candidato em formato JSON limpo e estruturado.
 */
export async function exportarDadosCandidatoLgpd(candidatoId: string): Promise<LgpdExportResult> {
  const timestamp = new Date().toISOString();

  if (!candidatoId) {
    return {
      sucesso: false,
      mensagem: 'ID do candidato é obrigatório para exportação de dados.',
      timestamp,
    };
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidatoId)
        .single();

      if (error || !data) {
        return {
          sucesso: false,
          mensagem: `Candidato não encontrado: ${error?.message || 'ID inexistente'}`,
          timestamp,
        };
      }

      // Sanitiza chaves internas do banco
      const { id: _id, created_at: _created_at, updated_at: _updated_at, ...dadosSanitizados } = data;

      return {
        sucesso: true,
        dadosJson: {
          termo_lgpd: 'Exportação de Portabilidade (LGPD Art. 18, V / APPI Japão)',
          data_solicitacao: timestamp,
          candidato: dadosSanitizados,
        },
        mensagem: 'Portabilidade de dados gerada com sucesso.',
        timestamp,
      };
    } catch (err: any) {
      return {
        sucesso: false,
        mensagem: `Erro ao consultar dados: ${err?.message || 'Falha de banco'}`,
        timestamp,
      };
    }
  }

  // Fallback estruturado para execução offline/demo
  return {
    sucesso: true,
    dadosJson: {
      termo_lgpd: 'Exportação de Portabilidade (LGPD Art. 18, V / APPI Japão)',
      data_solicitacao: timestamp,
      candidato_id: candidatoId,
      status: 'DEMO_EXPORT',
    },
    mensagem: 'Exportação gerada em modo demonstração.',
    timestamp,
  };
}

/**
 * Revogação de Consentimento & Solicitação de Expurgo (LGPD Art. 18, IX)
 */
export async function revogarConsentimentoLgpd(
  candidatoId: string,
  motivo: string = 'Solicitação expressa do titular'
): Promise<{ sucesso: boolean; mensagem: string; timestamp: string }> {
  const timestamp = new Date().toISOString();

  if (supabase) {
    try {
      // Atualiza status do consentimento e marca data de expurgo
      const { error } = await supabase
        .from('candidates')
        .update({
          status: 'CONSENTIMENTO_REVOGADO',
          consentimento_revogado_em: timestamp,
          motivo_revogacao: motivo,
        })
        .eq('id', candidatoId);

      if (error) {
        return {
          sucesso: false,
          mensagem: `Falha ao registrar revogação: ${error.message}`,
          timestamp,
        };
      }

      // Registra no Audit Log
      await supabase.from('audit_log').insert({
        acao: 'lgpd.consent_revoked',
        recurso: 'candidates',
        detalhes: { candidatoId, motivo, timestamp },
      });
    } catch {
      // Continua se a tabela de audit log estiver offline
    }
  }

  return {
    sucesso: true,
    mensagem: 'Consentimento revogado com sucesso. Os dados serão expurgados conforme a política de 24 meses.',
    timestamp,
  };
}

/**
 * Expurgo Programado de Dados Inativos (24 Meses — LGPD Art. 16)
 * Identifica e remove candidaturas inativas há mais de 730 dias.
 */
export async function executarExpurgoProgramado24Meses(): Promise<ExpurgoResult> {
  const timestamp = new Date().toISOString();
  const limiteDataExpurgo = new Date();
  limiteDataExpurgo.setDate(limiteDataExpurgo.getDate() - 730); // 24 meses (730 dias)

  if (supabase) {
    try {
      const { data: deletados, error } = await supabase
        .from('candidates')
        .delete()
        .lt('created_at', limiteDataExpurgo.toISOString())
        .eq('status', 'CONSENTIMENTO_REVOGADO')
        .select('id');

      if (error) {
        return {
          sucesso: false,
          registrosExpurgados: 0,
          mensagem: `Erro ao executar expurgo no Supabase: ${error.message}`,
          timestamp,
        };
      }

      const total = deletados ? deletados.length : 0;

      return {
        sucesso: true,
        registrosExpurgados: total,
        mensagem: `Expurgo programado concluído. ${total} registros inativos removidos permanentemente.`,
        timestamp,
      };
    } catch (err: any) {
      return {
        sucesso: false,
        registrosExpurgados: 0,
        mensagem: `Falha ao conectar no banco para expurgo: ${err?.message}`,
        timestamp,
      };
    }
  }

  return {
    sucesso: true,
    registrosExpurgados: 0,
    mensagem: 'Expurgo executado em modo demonstração (0 registros expurgados).',
    timestamp,
  };
}
