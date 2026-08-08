import React, { useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { ETAPAS_KANBAN } from '../constants/kanban';

export interface CandidaturaKanban {
  id: string;
  status: string;
  updated_at: string;
  created_at: string;
  candidates: {
    nome_completo: string;
    telefone: string | null;
    cidade: string | null;
    estado: string | null;
    altura_cm?: number | null;
    peso_kg?: number | null;
    tem_tatuagem?: boolean | null;
    geracao?: string | null;
  } | null;
  jobs: { titulo: string } | null;
}

interface Props {
  candidaturas: CandidaturaKanban[];
  onMoverStatus: (id: string, novoStatus: string) => Promise<void>;
  onExportarExcel: (candidato: any) => void;
  isDark?: boolean;
}

export const KanbanBoard: React.FC<Props> = ({
  candidaturas,
  onMoverStatus,
  onExportarExcel,
  isDark = true,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedFromStatus, setDraggedFromStatus] = useState<string | null>(null);
  const [erroTransicao, setErroTransicao] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string, statusAtual: string) => {
    setDraggedId(id);
    setDraggedFromStatus(statusAtual);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setErroTransicao(null);

    if (!draggedId || !draggedFromStatus) return;
    if (draggedFromStatus === targetStatus) return;

    try {
      await onMoverStatus(draggedId, targetStatus);
    } catch {
      setErroTransicao(`Transição de status inválida ou não permitida para o seu papel.`);
    } finally {
      setDraggedId(null);
      setDraggedFromStatus(null);
    }
  };

  return (
    <div className="space-y-4">
      {erroTransicao && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{erroTransicao}</span>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start">
        {ETAPAS_KANBAN.map((etapa) => {
          const cardsDaEtapa = candidaturas.filter((c) => c.status === etapa.id);

          return (
            <div
              key={etapa.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, etapa.id)}
              className={`min-w-[280px] w-[280px] rounded-xl border p-3 flex flex-col gap-3 transition-colors ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  : 'bg-slate-100 border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: etapa.cor }}
                  />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    {etapa.label}
                  </h4>
                </div>
                <span className="text-xs font-bold bg-slate-800 px-2.5 py-1 rounded-full text-slate-200">
                  {cardsDaEtapa.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 min-h-[350px]">
                {cardsDaEtapa.map((card) => {
                  const diasNoStatus = Math.floor(
                    (Date.now() - new Date(card.updated_at).getTime()) / 86_400_000
                  );
                  const atrasadoSLA = diasNoStatus > 15;
                  const cand = card.candidates;

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id, card.status)}
                      className={`p-4 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-200 ${
                        draggedId === card.id ? 'opacity-40 border-blue-500 scale-95' : ''
                      } ${
                        isDark
                          ? 'bg-slate-950 border-slate-800/90 hover:border-blue-500/60 shadow-lg'
                          : 'bg-white border-slate-200 shadow-sm hover:border-blue-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-base text-white line-clamp-1">
                          {cand?.nome_completo || 'Candidato Dekassegui'}
                        </span>
                      </div>

                      {card.jobs?.titulo && (
                        <p className="text-sm font-semibold text-blue-400 mb-1">
                          {card.jobs.titulo}
                        </p>
                      )}

                      <div className="text-xs text-slate-300 space-y-1 mb-2.5">
                        {cand?.telefone && <p className="font-medium">{cand.telefone}</p>}
                        {cand?.cidade && <p>{cand.cidade} / {cand.estado || 'SP'}</p>}
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-xs">
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            atrasadoSLA ? 'text-red-400' : 'text-slate-300'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          {diasNoStatus} dias no status
                        </span>

                        <button
                          type="button"
                          onClick={() => onExportarExcel(card)}
                          className="text-xs font-bold text-emerald-400 hover:underline bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800"
                        >
                          Exportar .XLS
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
