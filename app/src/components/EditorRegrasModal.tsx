import React, { useState } from 'react';
import { Sliders, Save, X } from 'lucide-react';
import { supabase } from '../dados/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  onRulesSaved: () => void;
}

export const EditorRegrasModal: React.FC<Props> = ({ isOpen, onClose, orgId, onRulesSaved }) => {
  const [limiteIdade, setLimiteIdade] = useState(55);
  const [exigeDescendencia, setExigeDescendencia] = useState(true);
  const [alertaTatuagem, setAlertaTatuagem] = useState(true);
  const [excecaoMesmaEmpresa, setExcecaoMesmaEmpresa] = useState(true);
  const [justificativa, setJustificativa] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificativa.trim()) {
      setMensagem('Por favor, digite a justificativa operacional da mudança para fins de auditoria.');
      return;
    }

    setSalvando(true);
    setMensagem(null);

    try {
      if (supabase) {
        await supabase.from('rulesets').insert({
          organization_id: orgId,
          version: 2,
          rules: {
            limiteIdade,
            exigeDescendencia,
            alertaTatuagem,
            excecaoMesmaEmpresa,
          },
          justificativa: justificativa.trim(),
          publicado_em: new Date().toISOString(),
        });
      }

      setMensagem('Regras de triagem atualizadas com sucesso! Versão 2 publicada.');
      setTimeout(() => {
        onRulesSaved();
        onClose();
      }, 1200);
    } catch (err: any) {
      setMensagem(`Erro ao salvar regras: ${err?.message || 'Falha de comunicação'}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Editor Visual de Regras de Triagem (Ruleset v2)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">1. Limite de Idade Padrão (anos)</label>
            <input
              type="number"
              value={limiteIdade}
              onChange={(e) => setLimiteIdade(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400">Candidatos com idade igual ou superior serão triados para reprovação (salvo exceção).</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/50">
            <div>
              <span className="font-semibold text-white block">2. Exceção para Mesma Fábrica/Empresa</span>
              <span className="text-[11px] text-slate-400">Permitir 55+ anos se o candidato já trabalhou previamente na FUJIARTE.</span>
            </div>
            <input
              type="checkbox"
              checked={excecaoMesmaEmpresa}
              onChange={(e) => setExcecaoMesmaEmpresa(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-950 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/50">
            <div>
              <span className="font-semibold text-white block">3. Exigência de Descendência Nikkei</span>
              <span className="text-[11px] text-slate-400">Encerrar fluxo se o candidato declarar não ser descendente (visto 定住者).</span>
            </div>
            <input
              type="checkbox"
              checked={exigeDescendencia}
              onChange={(e) => setExigeDescendencia(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-950 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/50">
            <div>
              <span className="font-semibold text-white block">4. Alerta & Revisão Manual para Tatuagem</span>
              <span className="text-[11px] text-slate-400">Encaminhar candidatos com tatuagem para revisão da agência antes da fábrica.</span>
            </div>
            <input
              type="checkbox"
              checked={alertaTatuagem}
              onChange={(e) => setAlertaTatuagem(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-950 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Justificativa Operacional da Mudança (LGPD Art. 20)</label>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex: Atualização da política de contratação da fábrica Kariya 2026..."
              className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:border-blue-500 min-h-[80px]"
            />
          </div>

          {mensagem && (
            <p className="p-2.5 rounded bg-blue-950/60 border border-blue-800 text-blue-200">
              {mensagem}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {salvando ? 'Salvando...' : 'Publicar Ruleset v2'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
