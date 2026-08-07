import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Props {
  candidaturas: any[];
  isDark?: boolean;
}

export const CentralAlertas: React.FC<Props> = ({ candidaturas, isDark = true }) => {
  const alertas: Array<{ tipo: 'critico' | 'atencao' | 'info'; titulo: string; mensagem: string; candidato: string }> = [];

  candidaturas.forEach((c) => {
    const cand = c.candidates || {};
    const nome = cand.nome_completo || 'Candidato';
    const diasNoStatus = Math.floor((Date.now() - new Date(c.updated_at).getTime()) / 86_400_000);

    if (diasNoStatus > 15 && c.status !== 'reprovado' && c.status !== 'admissao_concluida') {
      alertas.push({
        tipo: 'critico',
        titulo: 'SLA Atrasado (>15 dias sem movimentação)',
        mensagem: `Candidatura parada no status "${c.status}" há ${diasNoStatus} dias.`,
        candidato: nome,
      });
    }

    if (c.status === 'coe_andamento' && diasNoStatus > 20) {
      alertas.push({
        tipo: 'atencao',
        titulo: 'COE Imigração Japão Retido',
        mensagem: `Processo de Certificado de Elegibilidade na imigração japonesa excedeu o tempo médio em ${diasNoStatus} dias.`,
        candidato: nome,
      });
    }

    if (cand.passaporte_validade) {
      const validade = new Date(cand.passaporte_validade);
      const mesesParaVencer = (validade.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
      if (mesesParaVencer < 6) {
        alertas.push({
          tipo: 'atencao',
          titulo: 'Passaporte Vencendo em Breve',
          mensagem: `Validade do passaporte expira em ${Math.max(0, Math.round(mesesParaVencer))} meses (${cand.passaporte_validade}).`,
          candidato: nome,
        });
      }
    }
  });

  return (
    <div className={`p-6 rounded-xl border space-y-4 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <ShieldAlert className="w-6 h-6 text-amber-400" />
        <h3 className="text-base font-bold uppercase tracking-wider text-white">
          Central de Alertas & SLAs de Imigração (COE / Visto)
        </h3>
        <span className="ml-auto text-sm font-bold px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
          {alertas.length} pendências
        </span>
      </div>

      {alertas.length === 0 ? (
        <div className="flex items-center gap-2.5 text-sm font-medium text-emerald-400 p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Todos os processos e prazos de imigração estão em dia sem atrasos de SLA.</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto">
          {alertas.map((alerta, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
                alerta.tipo === 'critico'
                  ? 'bg-red-950/50 border-red-800/80 text-red-100'
                  : 'bg-amber-950/50 border-amber-800/80 text-amber-100'
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="flex justify-between font-bold text-white text-base">
                  <span>{alerta.titulo}</span>
                  <span className="text-slate-300 font-semibold">{alerta.candidato}</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-normal">{alerta.mensagem}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
