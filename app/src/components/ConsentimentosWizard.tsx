import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { TEXTOS_CONSENTIMENTO } from '../constants/consentimento';

export interface ConsentimentoState {
  geral_v1: boolean;
  saude_v1: boolean;
  descendencia_v1: boolean;
  transferencia_internacional_v1: boolean;
}

interface Props {
  consentimentos: ConsentimentoState;
  onChange: (novosConsentimentos: ConsentimentoState) => void;
  onBlockBSkipChange?: (pularBlocoB: boolean) => void;
}

export const ConsentimentosWizard: React.FC<Props> = ({
  consentimentos,
  onChange,
  onBlockBSkipChange,
}) => {
  const toggleConsent = (chave: keyof ConsentimentoState) => {
    const proximoValor = !consentimentos[chave];
    const novos = { ...consentimentos, [chave]: proximoValor };
    onChange(novos);

    if (chave === 'saude_v1' && onBlockBSkipChange) {
      // Se desmarcar saúde, pula o Bloco B
      onBlockBSkipChange(!proximoValor);
    }
  };

  const pendenciasObrigatorias =
    !consentimentos.geral_v1 ||
    !consentimentos.descendencia_v1 ||
    !consentimentos.transferencia_internacional_v1;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-700/60 p-5 rounded-xl text-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">
            Termos de Consentimento e Privacidade (LGPD & APPI Japão)
          </h3>
        </div>
        <p className="text-sm text-slate-400">
          A FUJIARTE respeita a Lei Geral de Proteção de Dados (LGPD) e a Lei de Proteção de Informações Pessoais do Japão (APPI). 
          Revise e confirme os consentimentos abaixo para prosseguir.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(Object.keys(TEXTOS_CONSENTIMENTO) as Array<keyof ConsentimentoState>).map((key) => {
          const item = TEXTOS_CONSENTIMENTO[key];
          const Icone = item.icone;
          const marcado = consentimentos[key];

          return (
            <div
              key={key}
              onClick={() => toggleConsent(key)}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                marcado
                  ? 'bg-blue-950/40 border-blue-500/80 shadow-md shadow-blue-950/30'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() => {}} // acionado pelo div
                    className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-950 cursor-pointer"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icone className={`w-5 h-5 ${marcado ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="font-semibold text-white text-sm">{item.titulo}</span>
                    {item.obrigatorio ? (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-950/80 text-red-300 border border-red-800/60 rounded-full">
                        Obrigatório
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 rounded-full">
                        Opcional (Pula Bloco B de Saúde se recusado)
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">{item.texto}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pendenciasObrigatorias && (
        <div className="flex items-center gap-3 p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Atenção: Os termos <strong>Geral</strong>, <strong>Descendência</strong> e <strong>Transferência Internacional</strong> são obrigatórios para viabilizar a análise do seu visto e candidatura.
          </span>
        </div>
      )}
    </div>
  );
};
